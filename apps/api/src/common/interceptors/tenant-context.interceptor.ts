import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Wraps every authenticated request in a Prisma interactive transaction
 * with SET LOCAL for RLS. Runs after JwtAuthGuard + RolesGuard so
 * request.user is populated.
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
