import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import * as jwt from 'jsonwebtoken';

export interface JwtPayload {
  sub: string;
  tenantId: string;
  rol: string;
  jti: string;
  iat: number;
  exp: number;
  mfaSetupRequired?: boolean;
  mfaVerified?: boolean;
}

// Routes that partial MFA tokens are allowed to access
const MFA_SETUP_PATHS = ['/auth/mfa/setup', '/auth/mfa/verify'];

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing Bearer token');
    }

    const token = authHeader.slice(7);
    try {
      const secret = process.env['JWT_SECRET'];
      if (!secret) throw new Error('JWT_SECRET not configured');
      const payload = jwt.verify(token, secret) as JwtPayload;
      // TODO: Check jti against Redis revocation list

      // Block partial MFA tokens from accessing anything except MFA setup/verify
      if (payload.mfaSetupRequired) {
        const requestPath = request.url?.split('?')[0] ?? '';
        if (!MFA_SETUP_PATHS.some((p) => requestPath.endsWith(p))) {
          throw new UnauthorizedException('MFA setup required — complete second factor verification');
        }
      }

      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
