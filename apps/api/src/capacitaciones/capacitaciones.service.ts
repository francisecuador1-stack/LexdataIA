import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CapacitacionesService {
  constructor(private readonly prisma: PrismaService) {}

  async listCursos() {
    return { data: [], total: 0 };
  }

  async findCurso(id: string) {
    return { id, titulo: 'stub' };
  }

  async createEvaluacion(data: any) {
    return { id: 'stub', ...data };
  }

  async listEvaluaciones() {
    return { data: [], total: 0 };
  }

  async getCertificado(id: string) {
    return { id, url: 'stub' };
  }

  async getCentral() {
    return { totalCursos: 0, totalUsuarios: 0, completados: 0 };
  }

  async getInforme() {
    return { contenido: 'stub' };
  }
}
