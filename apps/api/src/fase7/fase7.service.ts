import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class Fase7Service {
  constructor(private readonly prisma: PrismaService) {}

  async getSeguimiento() {
    return { resumen: {} };
  }

  async listRecomendaciones() {
    return { data: [], total: 0 };
  }

  async verificarRecomendacion(id: string) {
    return { id, estado: 'VERIFICADA' };
  }

  async getMadurez() {
    return { nivel: 0, detalles: {} };
  }

  async listLecciones() {
    return { data: [], total: 0 };
  }

  async createLeccion(data: any) {
    return { id: 'stub', ...data };
  }

  async listOportunidades() {
    return { data: [], total: 0 };
  }
}
