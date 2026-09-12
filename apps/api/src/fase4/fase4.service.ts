import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class Fase4Service {
  constructor(private readonly prisma: PrismaService) {}

  async listControles() {
    return { data: [], total: 0 };
  }

  async createControl(data: any) {
    return { id: 'stub', ...data };
  }

  async calificarControl(id: string, data: any) {
    return { id, calificacion: data.calificacion ?? 0, estado: 'CALIFICADO' };
  }

  async listMedidas() {
    return { data: [], total: 0 };
  }

  async validacionPrincipios() {
    return { principios: [], cumplimiento: 0 };
  }

  async listHallazgos() {
    return { data: [], total: 0 };
  }

  async createHallazgo(data: any) {
    return { id: 'stub', ...data };
  }

  async listPlanesAccion() {
    return { data: [], total: 0 };
  }

  async createPlanAccion(data: any) {
    return { id: 'stub', ...data };
  }
}
