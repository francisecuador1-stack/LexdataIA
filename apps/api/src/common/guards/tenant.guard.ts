import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * TenantGuard: sets PostgreSQL session variables for RLS enforcement.
 * Runs after JwtAuthGuard so request.user is populated.
 *
 * INV-1: Every business row is protected by RLS with tenant_id.
 * INV-11: Uses request.jwt.claims convention for Supabase compatibility.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user?.tenantId && user?.rol) {
      const claims = JSON.stringify({
        tenant_id: user.tenantId,
        rol: user.rol,
        sub: user.sub,
      });
      await this.prisma.$executeRawUnsafe(
        `SELECT set_config('request.jwt.claims', '${claims}', true)`,
      );
    }

    return true;
  }
}
