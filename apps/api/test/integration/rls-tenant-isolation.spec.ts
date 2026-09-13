/**
 * RLS Tenant Isolation — Integration Tests
 *
 * These tests verify the FULL chain:
 *   Proxy → withTenantTransaction → SET LOCAL → RLS policies → lexdata_app role
 *
 * Requires:
 *   - DATABASE_URL pointing to lexdata_app (NOBYPASSRLS)
 *   - SYSTEM_DB_URL pointing to superuser (for seeding)
 *   - Migrations applied (schema + FORCE RLS)
 *
 * CI provides this via pgvector/pg16 service container + the setup step
 * in ci.yml that creates lexdata_app and applies migrations.
 *
 * Run: pnpm --filter @lexdata/api test:integration -- --testPathPattern=rls
 */
import { randomUUID } from 'crypto';
import { PrismaClient } from '@prisma/client';
import { PrismaService, TenantContext } from '../../src/prisma/prisma.service';

const DATABASE_URL = process.env['DATABASE_URL'];
const SYSTEM_DB_URL = process.env['SYSTEM_DB_URL'] || DATABASE_URL;

// Skip entirely if no database is available
const describeWithDb = DATABASE_URL ? describe : describe.skip;

describeWithDb('RLS Tenant Isolation (real Postgres, lexdata_app role)', () => {
  let systemPrisma: PrismaClient; // superuser — for seeding and verification
  let appPrisma: PrismaService;   // lexdata_app — what the API actually uses
  let tenantAId: string;
  let tenantBId: string;

  beforeAll(async () => {
    // Superuser connection for seeding (bypasses RLS)
    systemPrisma = new PrismaClient({
      datasources: { db: { url: SYSTEM_DB_URL } },
    });

    // App connection as lexdata_app (NOBYPASSRLS, subject to RLS)
    appPrisma = new PrismaService();

    // Seed two tenants with their own data
    const tenantA = await systemPrisma.tenant.create({
      data: { nombre: 'RLS-Test Tenant A', plan: 'test' },
    });
    tenantAId = tenantA.id;

    const tenantB = await systemPrisma.tenant.create({
      data: { nombre: 'RLS-Test Tenant B', plan: 'test' },
    });
    tenantBId = tenantB.id;

    // Seed clientes for each tenant
    await systemPrisma.cliente.create({
      data: {
        tenantId: tenantAId,
        razonSocial: 'Alpha Corp (A)',
        ruc: `17${randomUUID().replace(/-/g, '').slice(0, 8)}001`,
      },
    });
    await systemPrisma.cliente.create({
      data: {
        tenantId: tenantBId,
        razonSocial: 'Beta Corp (B)',
        ruc: `09${randomUUID().replace(/-/g, '').slice(0, 8)}001`,
      },
    });
  }, 30000);

  afterAll(async () => {
    // Cleanup via superuser
    await systemPrisma.cliente.deleteMany({
      where: { tenantId: { in: [tenantAId, tenantBId] } },
    });
    await systemPrisma.tenant.deleteMany({
      where: { id: { in: [tenantAId, tenantBId] } },
    });
    await systemPrisma.$disconnect();
    await appPrisma.$disconnect();
  });

  // ─── THE CRITICAL TEST ─────────────────────────────────────────────
  // Uses withTenantTransaction directly (no HTTP layer, no where clause).
  // This test exercises: Proxy → AsyncLocalStorage → SET LOCAL → RLS policies → role.
  // If SET LOCAL is removed, this test MUST fail (tenant A would see 0 rows).

  it('withTenantTransaction + findMany WITHOUT where: tenant A sees only its own rows', async () => {
    const ctxA: TenantContext = {
      tenantId: tenantAId,
      rol: 'DPO_HUMANO',
      sub: randomUUID(),
    };

    const result = await appPrisma.withTenantTransaction(ctxA, async () => {
      // NO where clause — RLS must do the filtering
      return appPrisma.cliente.findMany();
    });

    const names = result.map((c) => c.razonSocial);
    expect(names).toContain('Alpha Corp (A)');
    expect(names).not.toContain('Beta Corp (B)');
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  it('withTenantTransaction + findMany WITHOUT where: tenant B sees only its own rows', async () => {
    const ctxB: TenantContext = {
      tenantId: tenantBId,
      rol: 'DPO_HUMANO',
      sub: randomUUID(),
    };

    const result = await appPrisma.withTenantTransaction(ctxB, async () => {
      return appPrisma.cliente.findMany();
    });

    const names = result.map((c) => c.razonSocial);
    expect(names).toContain('Beta Corp (B)');
    expect(names).not.toContain('Alpha Corp (A)');
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  // ─── NEGATIVE TEST ─────────────────────────────────────────────────
  // Without SET LOCAL (no tenant context), lexdata_app with FORCE RLS
  // should see ZERO rows — proves the mechanism is necessary.

  it('without withTenantTransaction, lexdata_app sees zero rows (FORCE RLS)', async () => {
    // Direct query without SET LOCAL — no tenant context
    const result = await appPrisma.cliente.findMany();
    expect(result).toHaveLength(0);
  });

  // ─── CROSS-TABLE TEST ──────────────────────────────────────────────
  // Verify isolation works on the tenants table itself (isolated by id = tenant_id)

  it('tenant A only sees its own tenant record', async () => {
    const ctxA: TenantContext = {
      tenantId: tenantAId,
      rol: 'DPO_HUMANO',
      sub: randomUUID(),
    };

    const result = await appPrisma.withTenantTransaction(ctxA, async () => {
      return appPrisma.tenant.findMany();
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(tenantAId);
    expect(result[0].nombre).toBe('RLS-Test Tenant A');
  });
});
