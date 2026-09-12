import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// ---------------------------------------------------------------------------
// Data Retention Service
//
// INV-3: Evidencias are append-only with 5-year retention.
// This service MARKS records that have exceeded their retention period.
// It NEVER auto-deletes data — purge requires explicit DPO approval plus
// an audit_log entry (INV-4, INV-6).
// ---------------------------------------------------------------------------

@Injectable()
export class RetentionService {
  private readonly logger = new Logger(RetentionService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Scheduled job (cron): scan for evidencias and documentos whose
   * `retencion_hasta` date has passed and flag them as eligible for review.
   *
   * Does NOT delete anything automatically.
   *
   * @returns Number of records marked as retention-expired.
   */
  async markExpiredRecords(): Promise<{ evidencias: number; documentos: number }> {
    const now = new Date();

    // Mark evidencias past retention period
    const evidenciasResult = await this.prisma.$executeRawUnsafe(
      `UPDATE evidencias
         SET estado_retencion = 'EXPIRADA'
       WHERE retencion_hasta < $1
         AND estado_retencion = 'VIGENTE'`,
      now,
    );

    // Mark documentos past retention period
    const documentosResult = await this.prisma.$executeRawUnsafe(
      `UPDATE documentos
         SET estado_retencion = 'EXPIRADA'
       WHERE retencion_hasta < $1
         AND estado_retencion = 'VIGENTE'`,
      now,
    );

    this.logger.log(
      `Retention scan complete: ${evidenciasResult} evidencias, ${documentosResult} documentos marked as expired`,
    );

    return {
      evidencias: evidenciasResult,
      documentos: documentosResult,
    };
  }

  /**
   * Purge flow: requires DPO approval before physical deletion.
   *
   * INV-3, INV-6: Only a human DPO can authorize purge.  An audit_log
   * entry is created BEFORE the data is removed.
   *
   * @param recordIds  IDs of the records to purge
   * @param table      Target table ('evidencias' | 'documentos')
   * @param approvedBy User ID of the DPO who approved the purge
   * @param tenantId   Tenant context
   */
  async purgeWithApproval(
    recordIds: string[],
    table: 'evidencias' | 'documentos',
    approvedBy: string,
    tenantId: string,
  ): Promise<{ purged: number }> {
    if (recordIds.length === 0) {
      return { purged: 0 };
    }

    // Validate that all records are already marked as expired
    const expiredCount = await this.prisma.$executeRawUnsafe(
      `SELECT COUNT(*) FROM ${table}
       WHERE id = ANY($1::uuid[])
         AND tenant_id = $2
         AND estado_retencion = 'EXPIRADA'`,
      recordIds,
      tenantId,
    );

    if (expiredCount !== recordIds.length) {
      throw new Error(
        `Cannot purge: not all records are in EXPIRADA state. ` +
        `Expected ${recordIds.length}, found ${expiredCount} expired.`,
      );
    }

    // INV-4: Write audit_log BEFORE deleting
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO audit_log (tenant_id, actor_id, actor_type, action, entity_type, entity_ids, details)
       VALUES ($1, $2, 'HUMANO', 'PURGE_RETENTION', $3, $4, $5)`,
      tenantId,
      approvedBy,
      table,
      JSON.stringify(recordIds),
      JSON.stringify({
        reason: 'Retention period exceeded — DPO-approved purge',
        record_count: recordIds.length,
      }),
    );

    // Physical deletion
    const deleted = await this.prisma.$executeRawUnsafe(
      `DELETE FROM ${table}
       WHERE id = ANY($1::uuid[])
         AND tenant_id = $2
         AND estado_retencion = 'EXPIRADA'`,
      recordIds,
      tenantId,
    );

    this.logger.warn(
      `Purged ${deleted} records from ${table} — approved by ${approvedBy} for tenant ${tenantId}`,
    );

    return { purged: deleted };
  }

  /**
   * List records in EXPIRADA state for DPO review before purge approval.
   */
  async listExpiredRecords(
    tenantId: string,
    table: 'evidencias' | 'documentos',
    page = 1,
    limit = 50,
  ) {
    const offset = (page - 1) * limit;

    const records = await this.prisma.$queryRawUnsafe(
      `SELECT id, nombre, hash_sha256, retencion_hasta, created_at
       FROM ${table}
       WHERE tenant_id = $1
         AND estado_retencion = 'EXPIRADA'
       ORDER BY retencion_hasta ASC
       LIMIT $2 OFFSET $3`,
      tenantId,
      limit,
      offset,
    );

    return records;
  }
}
