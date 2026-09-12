import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Sets RLS context on every request using Supabase's `request.jwt.claims` convention.
 *
 * INV-11: The API connects as `lexdata_app` (NOBYPASSRLS). RLS policies read
 * tenant_id and rol from `current_setting('request.jwt.claims')::jsonb`.
 *
 * This middleware extracts tenant_id and rol from the validated JWT (populated
 * by the auth guard) and sets them as a PostgreSQL session variable so that
 * RLS policies can enforce tenant isolation without WHERE clauses in app code.
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    // TODO: Extract from validated JWT via auth guard.
    // For now, read from headers (dev only — remove before production).
    const tenantId = req.headers['x-tenant-id'] as string | undefined;
    const rol = req.headers['x-rol'] as string | undefined;

    if (tenantId && rol) {
      const claims = JSON.stringify({ tenant_id: tenantId, rol });
      await this.prisma.$executeRawUnsafe(
        `SELECT set_config('request.jwt.claims', '${claims}', true)`,
      );
    }

    next();
  }
}
