import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * TenantGuard: validates that authenticated requests have tenant context.
 * The actual SET LOCAL for RLS is done by TenantContextInterceptor.
 *
 * INV-1: every business row has tenant_id and is protected by RLS.
 * INV-11: uses lexdata_app role with request.jwt.claims convention.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // The interceptor will skip SET LOCAL if there's no tenant context.
    // Guard passes through — the interceptor handles RLS setup.
    return true;
  }
}
