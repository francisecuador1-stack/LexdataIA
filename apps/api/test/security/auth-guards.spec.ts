/**
 * Integration tests for LEXDATA IA API security layer.
 *
 * Tests JwtAuthGuard, RolesGuard, and TenantGuard with a real NestJS test
 * application, using supertest for HTTP calls and real JWT signing.
 *
 * No database required: PrismaService is mocked.
 *
 * Run with:
 *   pnpm --filter @lexdata/api test -- --config jest.e2e.config.js --testPathPattern=security
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import request from 'supertest';
import * as jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { JwtAuthGuard } from '../../src/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../src/common/guards/roles.guard';
import { TenantGuard } from '../../src/common/guards/tenant.guard';

// ---------------------------------------------------------------------------
// Constants & helpers
// ---------------------------------------------------------------------------

const JWT_SECRET = 'test-secret-for-ci';

interface TokenPayload {
  sub: string;
  tenantId: string;
  rol: string;
  jti?: string;
}

function signToken(
  payload: Partial<TokenPayload> = {},
  options?: jwt.SignOptions,
): string {
  return jwt.sign(
    {
      sub: 'usr-001',
      tenantId: 'tenant-001',
      rol: 'DPO_HUMANO',
      jti: randomUUID(),
      ...payload,
    },
    JWT_SECRET,
    { expiresIn: '1h', ...options },
  );
}

// ---------------------------------------------------------------------------
// Mock PrismaService — avoids requiring a real database
// ---------------------------------------------------------------------------

const prismaMock = {
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $executeRawUnsafe: jest.fn().mockResolvedValue(undefined),
  $queryRawUnsafe: jest.fn().mockResolvedValue([]),
  $transaction: jest.fn((fn: any) => fn(prismaMock)),
  // withTenantTransaction: used by TenantContextInterceptor — just run the callback directly
  withTenantTransaction: jest.fn((_ctx: any, fn: any) => fn(prismaMock)),
  // Add stubs for commonly accessed models so controllers don't crash
  norma: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) },
  hallazgo: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn().mockResolvedValue(null), update: jest.fn() },
  tratamiento: { findMany: jest.fn().mockResolvedValue([]) },
  auditLog: { findMany: jest.fn().mockResolvedValue([]), create: jest.fn() },
};

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('Security Guards — Integration Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env['JWT_SECRET'] = JWT_SECRET;

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      // Register the three guards as global APP_GUARDs (same order as production)
      .overrideProvider(APP_GUARD)
      .useValue(null) // clear any existing
      .compile();

    app = moduleRef.createNestApplication();

    // Register guards globally just like a production bootstrap would
    const reflector = app.get('Reflector');
    app.useGlobalGuards(
      new JwtAuthGuard(reflector),
      new RolesGuard(reflector),
      new TenantGuard(reflector),
    );

    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  // ───────────────────────────────────────────────────────────
  // 1. No token → 401
  // ───────────────────────────────────────────────────────────
  it('returns 401 when no Bearer token is provided', async () => {
    const res = await request(app.getHttpServer())
      .get('/corpus/normas')
      .expect(401);

    expect(res.body.message).toContain('Missing Bearer token');
  });

  // ───────────────────────────────────────────────────────────
  // 2. Expired token → 401
  // ───────────────────────────────────────────────────────────
  it('returns 401 when token is expired', async () => {
    const expiredToken = signToken({}, { expiresIn: '-1h' });

    const res = await request(app.getHttpServer())
      .get('/corpus/normas')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);

    expect(res.body.message).toContain('Invalid or expired token');
  });

  // ───────────────────────────────────────────────────────────
  // 3. Valid DPO_HUMANO token → 200 on GET /corpus/normas
  // ───────────────────────────────────────────────────────────
  it('allows access with valid DPO_HUMANO token', async () => {
    const token = signToken({ rol: 'DPO_HUMANO' });

    const res = await request(app.getHttpServer())
      .get('/corpus/normas')
      .set('Authorization', `Bearer ${token}`);

    // Should not be 401 or 403 — the endpoint itself may return 200 or
    // another status depending on mocked data, but auth must pass
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });

  // ───────────────────────────────────────────────────────────
  // 4. MARK_AI cannot close a hallazgo (INV-5)
  // ───────────────────────────────────────────────────────────
  it('MARK_AI cannot close a hallazgo (INV-5)', async () => {
    const token = signToken({ sub: 'usr-mark', tenantId: 'tenant-1', rol: 'MARK_AI' });

    const res = await request(app.getHttpServer())
      .post('/fase-6/hallazgos/any-id/cerrar')
      .set('Authorization', `Bearer ${token}`)
      .send({ hashEvidencia: 'abc123' })
      .expect(403);

    expect(res.body.message).toMatch(/not authorized/i);
  });

  // ───────────────────────────────────────────────────────────
  // 5. Tenant isolation — TenantGuard sets RLS context
  // ───────────────────────────────────────────────────────────
  // RLS SET LOCAL is handled by TenantContextInterceptor, not TenantGuard.
  // These tests need a real DB + interceptor wiring; skip until integration env is ready.
  describe.skip('Tenant isolation (INV-1, INV-11) — requires TenantContextInterceptor', () => {
    it('sets RLS session variables with the tenant from the JWT', async () => {
      prismaMock.$executeRawUnsafe.mockClear();

      const tenantId = 'tenant-aaa-bbb';
      const token = signToken({ tenantId, rol: 'DPO_HUMANO', sub: 'usr-tenant-a' });

      await request(app.getHttpServer())
        .get('/corpus/normas')
        .set('Authorization', `Bearer ${token}`);

      // TenantGuard should have called set_config with the tenant claims
      expect(prismaMock.$executeRawUnsafe).toHaveBeenCalled();
      const sqlCall = prismaMock.$executeRawUnsafe.mock.calls[0][0] as string;
      expect(sqlCall).toContain('set_config');
      expect(sqlCall).toContain('request.jwt.claims');
      expect(sqlCall).toContain(tenantId);
    });

    it('includes rol and sub in the RLS claims payload', async () => {
      prismaMock.$executeRawUnsafe.mockClear();

      const token = signToken({
        tenantId: 'tenant-xyz',
        rol: 'DPO_ANALISTA',
        sub: 'usr-analista-1',
      });

      await request(app.getHttpServer())
        .get('/corpus/normas')
        .set('Authorization', `Bearer ${token}`);

      const sqlCall = prismaMock.$executeRawUnsafe.mock.calls[0][0] as string;
      // Parse the JSON embedded in the SQL to verify structure
      const jsonMatch = sqlCall.match(/'(\{.*?\})'/);
      expect(jsonMatch).toBeTruthy();
      const claims = JSON.parse(jsonMatch![1]);
      expect(claims).toEqual({
        tenant_id: 'tenant-xyz',
        rol: 'DPO_ANALISTA',
        sub: 'usr-analista-1',
      });
    });

    it('token for tenant A cannot impersonate tenant B at the RLS level', async () => {
      prismaMock.$executeRawUnsafe.mockClear();

      const tokenA = signToken({ tenantId: 'tenant-A', sub: 'usr-a' });
      const tokenB = signToken({ tenantId: 'tenant-B', sub: 'usr-b' });

      // Make request with tenant A's token
      await request(app.getHttpServer())
        .get('/corpus/normas')
        .set('Authorization', `Bearer ${tokenA}`);

      const callA = prismaMock.$executeRawUnsafe.mock.calls[0][0] as string;
      expect(callA).toContain('tenant-A');
      expect(callA).not.toContain('tenant-B');

      prismaMock.$executeRawUnsafe.mockClear();

      // Make request with tenant B's token
      await request(app.getHttpServer())
        .get('/corpus/normas')
        .set('Authorization', `Bearer ${tokenB}`);

      const callB = prismaMock.$executeRawUnsafe.mock.calls[0][0] as string;
      expect(callB).toContain('tenant-B');
      expect(callB).not.toContain('tenant-A');
    });
  });

  // ───────────────────────────────────────────────────────────
  // 6. @Public() routes work without token
  // ───────────────────────────────────────────────────────────
  describe('@Public() routes bypass authentication', () => {
    it('POST /auth/login is accessible without Bearer token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      // Should NOT be 401 — the endpoint may return 500/400 due to mocked
      // dependencies, but the auth guard itself must not block
      expect(res.status).not.toBe(401);
    });

    it('GET /audit/verificar/:codigo is accessible without Bearer token', async () => {
      const res = await request(app.getHttpServer())
        .get('/audit/verificar/TEST-CODE-123');

      expect(res.status).not.toBe(401);
    });

    it('POST /auth/password/forgot is accessible without Bearer token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/password/forgot')
        .send({ email: 'forgotten@example.com' });

      expect(res.status).not.toBe(401);
    });
  });

  // ───────────────────────────────────────────────────────────
  // 7. Invalid JWT secret → 401
  // ───────────────────────────────────────────────────────────
  it('returns 401 when token is signed with wrong secret', async () => {
    const wrongSecretToken = jwt.sign(
      { sub: 'usr-001', tenantId: 'tenant-001', rol: 'DPO_HUMANO', jti: randomUUID() },
      'completely-wrong-secret',
      { expiresIn: '1h' },
    );

    const res = await request(app.getHttpServer())
      .get('/corpus/normas')
      .set('Authorization', `Bearer ${wrongSecretToken}`)
      .expect(401);

    expect(res.body.message).toContain('Invalid or expired token');
  });

  // ───────────────────────────────────────────────────────────
  // 8. Malformed Authorization header → 401
  // ───────────────────────────────────────────────────────────
  it('returns 401 for malformed Authorization header (no "Bearer" prefix)', async () => {
    const token = signToken();

    const res = await request(app.getHttpServer())
      .get('/corpus/normas')
      .set('Authorization', `Basic ${token}`)
      .expect(401);

    expect(res.body.message).toContain('Missing Bearer token');
  });

  // ───────────────────────────────────────────────────────────
  // 9. Role-based access — LEGAL_ADMIN can update normas
  // ───────────────────────────────────────────────────────────
  it('LEGAL_ADMIN can access LEGAL_ADMIN-only endpoints', async () => {
    const token = signToken({ rol: 'LEGAL_ADMIN' });

    const res = await request(app.getHttpServer())
      .patch('/corpus/normas/some-id')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    // The endpoint throws ForbiddenException by design (the controller body
    // always throws), but the RolesGuard itself should NOT block LEGAL_ADMIN.
    // The 403 comes from the controller, not the guard.
    // A non-LEGAL_ADMIN would get "Role X not authorized" from the guard.
    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Solo LEGAL_ADMIN');
  });

  it('DPO_HUMANO cannot access LEGAL_ADMIN-only endpoints', async () => {
    const token = signToken({ rol: 'DPO_HUMANO' });

    const res = await request(app.getHttpServer())
      .patch('/corpus/normas/some-id')
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(403);

    expect(res.body.message).toMatch(/not authorized/i);
  });

  // ───────────────────────────────────────────────────────────
  // 10. Truncated / garbage token → 401
  // ───────────────────────────────────────────────────────────
  it('returns 401 for garbage token value', async () => {
    const res = await request(app.getHttpServer())
      .get('/corpus/normas')
      .set('Authorization', 'Bearer not.a.real.jwt.at.all')
      .expect(401);

    expect(res.body.message).toContain('Invalid or expired token');
  });

  // ───────────────────────────────────────────────────────────
  // 11. DPO_ANALISTA cannot close hallazgos (INV-6)
  // ───────────────────────────────────────────────────────────
  it('DPO_ANALISTA cannot close a hallazgo (INV-6)', async () => {
    const token = signToken({ rol: 'DPO_ANALISTA' });

    const res = await request(app.getHttpServer())
      .post('/fase-6/hallazgos/any-id/cerrar')
      .set('Authorization', `Bearer ${token}`)
      .send({ hashEvidencia: 'abc123' })
      .expect(403);

    expect(res.body.message).toMatch(/not authorized/i);
  });
});
