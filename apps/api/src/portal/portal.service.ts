import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PortalService {
  constructor(private readonly prisma: PrismaService) {}

  async listPims() {
    return { data: [], total: 0 };
  }

  async responderPims(data: any) {
    return { id: 'stub', ...data };
  }

  async crearRegistro(data: any) {
    // TODO: formulario SPDP + Pd-VaR calculation
    return { id: 'stub', pdVar: 0, ...data };
  }

  async getResultadoRegistro(id: string) {
    return { id, pdVar: 0, resultado: 'stub' };
  }
}
