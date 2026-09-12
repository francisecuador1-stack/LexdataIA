import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AgenteService {
  constructor(private readonly prisma: PrismaService) {}

  async chat(data: any) {
    // TODO: integrate with MARK AI agent
    return { respuesta: 'stub', conversacionId: 'stub' };
  }

  async listConversaciones() {
    return { data: [], total: 0 };
  }

  async getConversacion(id: string) {
    return { id, mensajes: [] };
  }

  async getActividad() {
    return { eventos: [] };
  }
}
