import { Injectable, UnauthorizedException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { authenticator } from 'otplib';

// Roles that REQUIRE MFA
const MFA_REQUIRED_ROLES = ['DPO_HUMANO', 'LEGAL_ADMIN', 'SUPERADMIN'];

interface TokenPayload {
  sub: string;
  tenantId: string;
  rol: string;
  jti: string;
  mfaVerified?: boolean;
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  private get jwtSecret(): string {
    const secret = process.env['JWT_SECRET'];
    if (!secret) throw new Error('JWT_SECRET not configured');
    return secret;
  }

  private signAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: '15m' });
  }

  private signRefreshToken(payload: Pick<TokenPayload, 'sub' | 'jti'>): string {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: '7d' });
  }

  async login(email: string, password: string, totpCode?: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.activo) throw new UnauthorizedException('Credenciales inválidas');

    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) {
      // TODO: Track failed attempts in Redis for progressive lockout
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const requiresMfa = MFA_REQUIRED_ROLES.includes(user.rol);

    // If MFA required but not enabled, return partial session for setup
    if (requiresMfa && !user.mfaEnabled) {
      const partialJti = randomUUID();
      const partialToken = jwt.sign(
        { sub: user.id, tenantId: user.tenantId, rol: user.rol, jti: partialJti, mfaSetupRequired: true },
        this.jwtSecret,
        { expiresIn: '10m' },
      );
      return { accessToken: partialToken, mfaSetupRequired: true, requiresMfa: true };
    }

    // If MFA enabled, verify TOTP
    if (user.mfaEnabled) {
      if (!totpCode) throw new UnauthorizedException('Código MFA requerido');
      if (!user.mfaSecret) throw new UnauthorizedException('MFA no configurado correctamente');
      const totpValid = authenticator.verify({ token: totpCode, secret: user.mfaSecret });
      if (!totpValid) throw new UnauthorizedException('Código MFA inválido');
    }

    const jti = randomUUID();
    const payload: TokenPayload = {
      sub: user.id,
      tenantId: user.tenantId,
      rol: user.rol,
      jti,
      mfaVerified: user.mfaEnabled,
    };

    const accessToken = this.signAccessToken(payload);
    const refreshToken = this.signRefreshToken({ sub: user.id, jti });

    // Update ultimo_acceso
    await this.prisma.user.update({
      where: { id: user.id },
      data: { ultimoAcceso: new Date() },
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol, tenantId: user.tenantId },
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = jwt.verify(refreshToken, this.jwtSecret) as { sub: string; jti: string };
      // TODO: Check jti against Redis revocation list
      // TODO: Revoke old jti, issue new one (rotation)

      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || !user.activo) throw new UnauthorizedException('Usuario inactivo');

      const newJti = randomUUID();
      const accessToken = this.signAccessToken({
        sub: user.id, tenantId: user.tenantId, rol: user.rol, jti: newJti,
        mfaVerified: user.mfaEnabled,
      });
      const newRefreshToken = this.signRefreshToken({ sub: user.id, jti: newJti });

      return { accessToken, refreshToken: newRefreshToken };
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  async logout(jti: string) {
    // TODO: Add jti to Redis revocation set with TTL matching token expiry
    return { message: 'Sesión cerrada' };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, nombre: true, email: true, rol: true, tenantId: true, mfaEnabled: true, ultimoAcceso: true },
    });
    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    return user;
  }

  async setupMfa(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    if (user.mfaEnabled) throw new BadRequestException('MFA ya está habilitado');

    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.email, 'LEXDATA IA', secret);

    // Store secret temporarily (will be confirmed in verify)
    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaSecret: secret },
    });

    return { secret, otpauthUrl };
  }

  async verifyMfa(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.mfaSecret) throw new BadRequestException('MFA no configurado');

    const totpValid = authenticator.verify({ token: code, secret: user.mfaSecret });
    if (!totpValid) throw new UnauthorizedException('Código MFA inválido');

    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: true },
    });

    return { message: 'MFA habilitado exitosamente' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { message: 'Si el correo existe, recibirá un enlace de recuperación' };

    const resetToken = jwt.sign({ sub: user.id, purpose: 'reset' }, this.jwtSecret, { expiresIn: '30m' });
    // TODO: Send email with reset link containing resetToken
    return { message: 'Si el correo existe, recibirá un enlace de recuperación' };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as { sub: string; purpose: string };
      if (payload.purpose !== 'reset') throw new BadRequestException('Token inválido');

      if (newPassword.length < 12) throw new BadRequestException('La contraseña debe tener al menos 12 caracteres');

      const hash = await argon2.hash(newPassword);
      await this.prisma.user.update({
        where: { id: payload.sub },
        data: { passwordHash: hash },
      });

      return { message: 'Contraseña actualizada' };
    } catch {
      throw new BadRequestException('Token inválido o expirado');
    }
  }

  /** Hash a password for seeding */
  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }
}
