/**
 * RLS Tenant Isolation — Integration Test
 *
 * Requires a real Postgres with:
 *   - supabase/migrations applied (schema + FORCE RLS)
 *   - lexdata_app role (NOBYPASSRLS)
 *   - DATABASE_URL pointing to lexdata_app
 *
 * CI provides this via the pgvector/pg16 service container.
 *
 * Run: pnpm --filter @lexdata/api test:integration -- --testPathPattern=rls
 */
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { PrismaClient } from '@prisma/client';

const JWT_SECRET = process.env['JWT_SECRET'] || 'test-secret-for-ci';
const DATABASE_URL = process.env['DATABASE_URL'];

// Skip if no real database is available
const describeWithDb = DATABASE_URL?.includes('localhost') ? describe : describe.skip;

function signToken(tenantId: string, rol = 'DPO_HUMANO'): string {
  return jwt.sign(
    { sub: randomUUID(), tenantId, rol, jti: randomUUID() },
    JWT_SECRET,
    { expiresIn: '1h' },
  );
}

describeWithDb('RLS Tenant Isolation (real Postgres)', () => {
  let app: INestApplication;
  let systemPrisma: PrismaClient; // connects as superuser for setup
  let tenantAId: string;
  let tenantBId: string;
  let userAId: string;
  let userBId: string;

  beforeAll(async () => {
    process.env['JWT_SECRET'] = JWT_SECRET;

    // System-level Prisma for seeding (connects as the DB owner, not lexdata_app)
    systemPrisma = new PrismaClient({
      datasources: {
        db: { url: process.env['SYSTEM_DB_URL'] || DATABASE_URL },
      },
    });

    // Seed two tenants with their own data
    const tenantA = await systemPrisma.tenant.create({
      data: { nombre: 'Tenant A (test)', plan: 'test' },
    });
    tenantAId = tenantA.id;

    const tenantB = await systemPrisma.tenant.create({
      data: { nombre: 'Tenant B (test)', plan: 'test' },
    });
    tenantBId = tenantB.id;

    // Users
    const argon2 = await import('argon2');
    const hash = await argon2.hash('test-password');

    const userA = await systemPrisma.user.create({
      data: {
        tenantId: tenantAId,
        email: `test-a-${randomUUID()}@test.ec`,
        nombre: 'User A',
        rol: 'DPO_HUMANO',
        passwordHash: hash,
      },
    });
    userAId = userA.id;

    const userB = await systemPrisma.user.create({
      data: {
        tenantId: tenantBId,
        email: `test-b-${randomUUID()}@test.ec`,
        nombre: 'User B',
        rol: 'DPO_HUMANO',
        passwordHash: hash,
      },
    });
    userBId = userB.id;

    // Seed data for each tenant
    await systemPrisma.cliente.create({
      data: {
        tenantId: tenantAId,
        razonSocial: 'Empresa Alpha S.A.',
        ruc: `17${Date.now().toString().slice(-8)}001`,
      },
    });

    await systemPrisma.cliente.create({
      data: {
        tenantId: tenantBId,
        razonSocial: 'Empresa Beta S.A.',
        ruc: `09${Date.now().toString().slice(-8)}001`,
      },
    });

    // Build the NestJS app
    const { AppModule } = await import('../../src/app.module');
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    // Cleanup test data
    await systemPrisma.cliente.deleteMany({
      where: { tenantId: { in: [tenantAId, tenantBId] } },
    });
    await systemPrisma.user.deleteMany({
      where: { tenantId: { in: [tenantAId, tenantBId] } },
    });
    await systemPrisma.tenant.deleteMany({
      where: { id: { in: [tenantAId, tenantBId] } },
    });
    await systemPrisma.$disconnect();
    await app?.close();
  });

  it('tenant A sees only its own clientes', async () => {
    const tokenA = signToken(tenantAId);

    const res = await request(app.getHttpServer())
      .get('/clientes')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);

    // Should see Alpha, not Beta
    expect(Array.isArray(res.body)).toBe(true);
    const names = res.body.map((c: any) => c.razonSocial);
    expect(names).toContain('Empresa Alpha S.A.');
    expect(names).not.toContain('Empresa Beta S.A.');
  });

  it('tenant B sees only its own clientes', async () => {
    const tokenB = signToken(tenantBId);

    const res = await request(app.getHttpServer())
      .get('/clientes')
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(200);

    const names = res.body.map((c: any) => c.razonSocial);
    expect(names).toContain('Empresa Beta S.A.');
    expect(names).not.toContain('Empresa Alpha S.A.');
  });

  it('tenant A cannot access a specific resource of tenant B', async () => {
    // Find tenant B's cliente ID via system connection
    const clienteB = await systemPrisma.cliente.findFirst({
      where: { tenantId: tenantBId },
    });
    expect(clienteB).toBeTruthy();

    const tokenA = signToken(tenantAId);

    // Attempt to access B's resource with A's token
    const res = await request(app.getHttpServer())
      .get(`/clientes/${clienteB!.id}`)
      .set('Authorization', `Bearer ${tokenA}`);

    // Should be 404 (RLS hides it) or 403, but NOT 200 with B's data
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.razonSocial).not.toBe('Empresa Beta S.A.');
  });

  it('without SET LOCAL, tenant A would see zero rows (FORCE RLS active)', async () => {
    // This test verifies the mechanism is necessary.
    // A direct query as lexdata_app WITHOUT set_config should return empty
    // because FORCE RLS is active and no claims are set.
    const directPrisma = new PrismaClient({
      datasources: {
        db: { url: DATABASE_URL },
      },
    });

    try {
      // Query without SET LOCAL — should get empty due to FORCE RLS
      // (lexdata_app has no default tenant context)
      const result = await directPrisma.cliente.findMany();
      expect(result).toHaveLength(0);
    } finally {
      await directPrisma.$disconnect();
    }
  });
});
