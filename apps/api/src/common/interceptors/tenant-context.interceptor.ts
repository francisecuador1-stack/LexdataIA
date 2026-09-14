import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { SKIP_TENANT_KEY } from '../decorators/skip-tenant.decorator';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Wraps every authenticated request in a Prisma interactive transaction
 * with SET LOCAL for RLS. Runs after JwtAuthGuard + RolesGuard so
 * request.user is populated.
 *
 * The transaction stays open for the duration of the handler.
 * For endpoints that make external API calls (e.g., /agente/chat →
 * Anthropic), the transaction timeout (30s) acts as a ceiling.
 * Long-running streaming endpoints should be marked @Public() or
 * use a dedicated pattern that commits the DB work first and then
 * streams the external response.
 *
 * Public routes (@Public()) skip the transaction.
 *
 * INV-1: every business row is protected by RLS with tenant_id.
 * INV-11: uses lexdata_app role with request.jwt.claims via SET LOCAL.
 */
@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return next.handle();

    // Global resources (corpus admin) skip tenant transaction
    const skipTenant = this.reflector.getAllAndOverride<boolean>(SKIP_TENANT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skipTenant) return next.handle();

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user?.tenantId || !user?.rol) return next.handle();

    return from(
      this.prisma.withTenantTransaction(
        { tenantId: user.tenantId, rol: user.rol, sub: user.sub },
        () =>
          new Promise<any>((resolve, reject) => {
            next.handle().subscribe({
              next: (val) => resolve(val),
              error: (err) => reject(err),
            });
          }),
      ),
    );
  }
}
