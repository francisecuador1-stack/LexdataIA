# LEXDATA IA — Runbook

Operational procedures for every alert defined in `infra/alerts/alert-rules.yaml`.

---

## Provisioning: lexdata_app Role

The API connects as `lexdata_app` (NOBYPASSRLS). This role is created by
the migrations but its **password must be set manually per environment**:

```sql
-- Connect as superuser (postgres)
ALTER ROLE lexdata_app LOGIN PASSWORD 'generate-a-strong-password-here';
```

Set `DATABASE_URL` in the environment to use this role:
```
DATABASE_URL=postgresql://lexdata_app:<password>@<host>:5432/<db>?pgbouncer=true
```

The role must have:
- `LOGIN` — granted by migration `20260912200000_lexdata_app_login.sql`
- `NOBYPASSRLS` — set at creation in `20260912000000_initial_schema.sql`
- `SELECT, INSERT, UPDATE, DELETE` on all tables — granted in initial migration

If deploying to Supabase, the role and grants are applied automatically
when you run `pnpm db:apply` as superuser.

---

## Incidente Near 24h Deadline

**Alert:** `IncidenteNear24hDeadline`
**Severity:** Critical
**Team:** Legal

### What it means

One or more security incidentes have less than 24 hours before the 72-hour SPDP notification deadline expires (Art. 41 LOPDP, INV-9). Failure to notify is a regulatory violation.

### Who to notify

1. DPO (Dra. Andreina Almeida) -- immediate
2. Legal team lead
3. SUPERADMIN (if DPO unreachable within 30 minutes)

### Resolution steps

1. Open the dashboard: `/fase-5` (Incidentes).
2. Identify incidentes in the `<24h` band.
3. Verify `fecha_deteccion` and confirm the clock calculation is correct (server-side, UTC).
4. If notification to SPDP has not been sent, the DPO must:
   - Prepare the notification document (use the PDF generation in Fase 6).
   - Submit via the SPDP portal or registered email.
   - Upload proof of notification as evidencia (INV-3).
5. Update the incidente status to `NOTIFICADO_SPDP`.
6. Verify the alert clears.

### How to pause MARK AI

If the agent is generating noise during an incident response:

```bash
# Pause agent queue
curl -X POST http://localhost:3001/admin/agent/pause \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Or directly in Redis:

```bash
redis-cli SET lexdata:agent:paused "true"
```

---

## Hash Chain Break

**Alert:** `HashChainBreakDetected`
**Severity:** Critical
**Team:** Engineering

### What it means

The append-only hash chain in `audit_log` or `evidencias` has a discontinuity. This could indicate data tampering, a software bug, or a failed migration (INV-3, INV-4).

### Who to notify

1. Engineering lead -- immediate
2. DPO -- within 1 hour
3. SUPERADMIN

### Resolution steps

1. Identify the break point:
   ```sql
   SELECT id, hash_sha256, prev_hash, created_at
   FROM audit_log
   WHERE prev_hash NOT IN (
     SELECT hash_sha256 FROM audit_log
   ) AND prev_hash != '0000000000000000000000000000000000000000000000000000000000000000'
   ORDER BY created_at;
   ```
2. Check recent deployments and migrations for schema changes.
3. Check backup logs for any restore operations that may have caused gaps.
4. If tampering is suspected, preserve the current state (snapshot) before any remediation.
5. Document the finding in the audit log manually if needed.
6. If the break is due to a bug, fix the code and backfill the chain if possible.

---

## Signature Queue Stale

**Alert:** `SignatureQueueStale`
**Severity:** Warning
**Team:** Legal

### What it means

Items in `solicitudes_firma` have been pending for more than 48 hours. This may block document workflows and regulatory submissions.

### Who to notify

1. DPO
2. Assigned signers (via email notification)

### Resolution steps

1. Query stale items:
   ```sql
   SELECT id, tipo, estado, created_at, asignado_a
   FROM solicitudes_firma
   WHERE estado = 'PENDIENTE'
     AND created_at < NOW() - INTERVAL '48 hours';
   ```
2. Contact assigned signers.
3. If a signer is unavailable, the DPO can reassign via the admin panel.
4. INV-5: MARK AI cannot sign -- only a human DPO can action these items.

---

## Agent Job Failure

**Alert:** `AgentJobFailure`
**Severity:** Warning
**Team:** Engineering

### What it means

One or more MARK AI agent jobs have failed in the BullMQ queue.

### Who to notify

1. Engineering on-call

### Resolution steps

1. Check worker logs:
   ```bash
   docker logs lexdata-worker --tail 200
   ```
2. Check BullMQ dashboard (Bull Board) at `/admin/queues`.
3. Common causes:
   - Anthropic API rate limit or timeout
   - Token budget exceeded for tenant
   - Invalid prompt or context overflow
4. Retry failed jobs if the issue is transient:
   ```bash
   curl -X POST http://localhost:3001/admin/agent/retry-failed \
     -H "Authorization: Bearer $ADMIN_TOKEN"
   ```
5. If the Anthropic API is down, pause the agent queue (see pause instructions above).

### How to pause the agent

```bash
curl -X POST http://localhost:3001/admin/agent/pause \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Resume when ready:

```bash
curl -X POST http://localhost:3001/admin/agent/resume \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Agent Token Budget

**Alert:** `AgentTokenBudgetExhausted`
**Severity:** Warning
**Team:** Engineering

### What it means

A tenant has consumed more than 500k tokens in 24 hours. This may indicate a runaway agent loop or abuse.

### Who to notify

1. Engineering on-call
2. Account manager for the tenant

### Resolution steps

1. Identify the tenant:
   ```bash
   curl http://localhost:3001/metrics | grep agent_tokens_total
   ```
2. Check recent agent conversations for that tenant in the database.
3. If a loop is detected, pause the agent for that tenant:
   ```bash
   redis-cli SET "lexdata:agent:paused:${TENANT_ID}" "true"
   ```
4. Review and fix the prompt or tool configuration that caused the loop.
5. Adjust the per-tenant token budget if needed.

---

## High Error Rate

**Alert:** `HighErrorRate`
**Severity:** Critical
**Team:** Engineering

### What it means

The API 5xx error rate exceeds 2% over a 5-minute window. The service is degraded.

### Who to notify

1. Engineering on-call -- immediate
2. Engineering lead (if sustained > 15 minutes)

### Resolution steps

1. Check API logs for error patterns:
   ```bash
   docker logs lexdata-api --tail 500 | grep -i error
   ```
2. Check database connectivity:
   ```bash
   curl http://localhost:3001/health
   ```
3. Check recent deployments -- rollback if a new release correlates:
   ```bash
   # Rollback to previous release
   git log --oneline -5
   # Deploy previous version
   ```
4. Check Supabase status page for provider outages.
5. Check Redis connectivity (BullMQ depends on it).
6. If database is overloaded, check for long-running queries:
   ```sql
   SELECT pid, now() - pg_stat_activity.query_start AS duration, query
   FROM pg_stat_activity
   WHERE state != 'idle'
   ORDER BY duration DESC
   LIMIT 10;
   ```

---

## Backup Failure

**Alert:** `BackupFailure`
**Severity:** Critical
**Team:** Infrastructure

### What it means

No successful database backup has completed in the last 24 hours. Data loss risk is elevated.

### Who to notify

1. Infrastructure / DevOps on-call -- immediate
2. Engineering lead
3. DPO (if backup gap exceeds 48 hours)

### Resolution steps

1. Check backup job logs:
   ```bash
   docker logs lexdata-backup --tail 200
   ```
2. Verify S3/storage connectivity and credentials.
3. Check available disk space on the backup target.
4. Manually trigger a backup:
   ```bash
   pg_dump --format=custom --compress=9 \
     -h $POSTGRES_HOST -U backup_readonly $POSTGRES_DB \
     > /backups/manual-$(date +%Y%m%d-%H%M%S).dump
   ```
5. Verify the manual backup is valid:
   ```bash
   pg_restore --list /backups/manual-*.dump | head -20
   ```
6. Fix the automated backup job and verify it runs on next schedule.

### How to restore from backup

See `infra/backup/backup-config.yaml` for the full restoration procedure.

Quick restore:

```bash
# Stop services
docker compose stop api worker

# Restore from latest snapshot
pg_restore --clean --if-exists \
  -h $POSTGRES_HOST -U postgres -d $POSTGRES_DB \
  /backups/latest.dump

# Verify hash chain integrity
psql $DATABASE_URL -f infra/scripts/verify-hash-chain.sql

# Restart services
docker compose start api worker

# Run health check
curl http://localhost:3001/health
```

---

## How to Reindex Corpus

If the legal corpus (`normas`, `controles_normativos`) needs reindexing after a restore or update:

```bash
curl -X POST http://localhost:3001/admin/corpus/reindex \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

This triggers the worker to:
1. Reload all normas from `packages/legal-corpus`.
2. Recompute embeddings (pgvector).
3. Verify `hash_sha256` for each norma (INV-2).

---

## Escalation Path

| Level | Contact | Trigger |
|-------|---------|---------|
| L1 | Engineering on-call | Any warning alert |
| L2 | Engineering lead | Critical alert or warning sustained > 30 min |
| L3 | DPO + SUPERADMIN | Regulatory deadline risk, data integrity breach |
| L4 | COGNITEX management | Service outage > 2 hours, data loss event |
