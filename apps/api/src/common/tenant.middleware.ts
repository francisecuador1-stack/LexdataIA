import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Sets RLS context variables on every request.
 * Extracts tenant_id and rol from the JWT (populated by auth guard).
 *
 * §12 of data model spec:
 *   "Cada request del API abre transacción con SET LOCAL app.tenant_id y app.rol
 *    extraídos del JWT. Nunca filtres por tenant solo en el where de Prisma."
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    // TODO: Extract from validated JWT. For now, read from headers (dev only).
    const tenantId = req.headers['x-tenant-id'] as string | undefined;
    const rol = req.headers['x-rol'] as string | undefined;

    if (tenantId) {
      await this.prisma.$executeRawUnsafe(
        `SET LOCAL "app.tenant_id" = '${tenantId}'`,
      );
    }
    if (rol) {
      await this.prisma.$executeRawUnsafe(
        `SET LOCAL "app.rol" = '${rol}'`,
      );
    }

    next();
  }
}
