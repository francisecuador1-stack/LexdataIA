import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class Fase2Service {
  constructor(private readonly prisma: PrismaService) {}

  // ── Tratamientos ──

  async listTratamientos() {
    return { data: [], total: 0 };
  }

  async createTratamiento(data: any) {
    return { id: 'stub', ...data };
  }

  async validarTratamiento(id: string) {
    return { id, estado: 'VALIDADO' };
  }

  // ── Activos ──

  async listActivos() {
    return { data: [], total: 0 };
  }

  async createActivo(data: any) {
    return { id: 'stub', ...data };
  }

  // ── Riesgos ──

  async listRiesgos() {
    return { data: [], total: 0 };
  }

  async matrizRiesgos() {
    return { matriz: [] };
  }

  async mapaCalor() {
    return { celdas: [] };
  }

  // ── EIPD ──

  async listEipd() {
    return { data: [], total: 0 };
  }

  async createEipd(data: any) {
    return { id: 'stub', ...data };
  }

  // ── Reportes ──

  async reporteRiesgos() {
    return { data: [], total: 0 };
  }
}
