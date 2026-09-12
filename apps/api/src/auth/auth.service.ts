import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(data: any) {
    return { accessToken: 'stub', refreshToken: 'stub' };
  }

  async refresh(data: any) {
    return { accessToken: 'stub-refreshed' };
  }

  async logout(data: any) {
    return { message: 'Sesion cerrada' };
  }

  async setupMfa(data: any) {
    return { qrCode: 'stub-qr', secret: 'stub-secret' };
  }

  async verifyMfa(data: any) {
    return { verified: true };
  }
}
