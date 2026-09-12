import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class Fase3Service {
  constructor(private readonly prisma: PrismaService) {}

  async getDiagnostico() {
    return { preguntas: [], respuestas: [] };
  }

  async responderDiagnostico(data: any) {
    return { id: 'stub', ...data };
  }

  async agregarPreguntas(data: any) {
    return { id: 'stub', ...data };
  }

  async getGobierno() {
    return { estructura: {} };
  }

  async getRoles() {
    return { data: [], total: 0 };
  }

  async getRecursos() {
    return { data: [], total: 0 };
  }

  async getBrechas() {
    return { data: [], total: 0 };
  }

  async listRecomendaciones() {
    return { data: [], total: 0 };
  }

  async verificarRecomendacion(id: string) {
    return { id, estado: 'VERIFICADA' };
  }

  async getInforme() {
    return { contenido: 'stub' };
  }
}
