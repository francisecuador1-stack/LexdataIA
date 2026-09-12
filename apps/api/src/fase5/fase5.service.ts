import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class Fase5Service {
  constructor(private readonly prisma: PrismaService) {}

  async listControles() {
    return { data: [], total: 0 };
  }

  async evaluarEficacia(id: string, data: any) {
    return { id, eficacia: 'EVALUADA', ...data };
  }

  async listHallazgos() {
    return { data: [], total: 0 };
  }

  async createHallazgo(data: any) {
    return { id: 'stub', ...data };
  }

  async listRecomendaciones() {
    return { data: [], total: 0 };
  }
}
