import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class Fase4Service {
  constructor(private readonly prisma: PrismaService) {}

  // ── Controles de diseno ──

  async listControles(tenantId: string) {
    const data = await this.prisma.control.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: { norma: true },
    });
    const porTipo = {
      TECNICO: data.filter((c) => c.tipo === 'TECNICO').length,
      ORGANIZATIVO: data.filter((c) => c.tipo === 'ORGANIZATIVO').length,
      LEGAL: data.filter((c) => c.tipo === 'LEGAL').length,
      DOCUMENTAL: data.filter((c) => c.tipo === 'DOCUMENTAL').length,
    };
    return { data, total: data.length, porTipo };
  }

  async createControl(
    tenantId: string,
    data: {
      tipo: 'TECNICO' | 'ORGANIZATIVO' | 'LEGAL' | 'DOCUMENTAL';
      titulo: string;
      descripcion?: string;
      baseNormativa: string;
      normaId?: string;
      categoria?: string;
      prioridad?: string;
      plazo?: string;
      responsable?: string;
    },
  ) {
    return this.prisma.control.create({
      data: {
        tenantId,
        tipo: data.tipo as any,
        titulo: data.titulo,
        descripcion: data.descripcion,
        baseNormativa: data.baseNormativa,
        normaId: data.normaId,
        categoria: data.categoria,
        prioridad: data.prioridad,
        plazo: data.plazo ? new Date(data.plazo) : undefined,
        responsable: data.responsable,
        estado: 'PROPUESTA',
      },
    });
  }

  async calificarControl(
    tenantId: string,
    id: string,
    data: {
      suficiencia: 'SUFICIENTE' | 'PROPORCIONAL' | 'INSUFICIENTE';
      userId: string;
    },
  ) {
    const control = await this.prisma.control.findFirst({
      where: { id, tenantId },
    });
    if (!control) throw new NotFoundException('Control no encontrado');

    return this.prisma.control.update({
      where: { id },
      data: {
        suficiencia: data.suficiencia as any,
        calificadoPor: data.userId,
        calificadoAt: new Date(),
      },
    });
  }

  // ── Medidas ──

  async listMedidas(tenantId: string, tipo?: string) {
    const where: any = { tenantId };
    if (tipo) where.tipo = tipo;

    const data = await this.prisma.medida.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return { data, total: data.length };
  }

  // ── Validacion de principios ──

  async listValidacionPrincipios(tenantId: string) {
    // RN-401: validations per treatment
    const data = await this.prisma.validacionPrincipio.findMany({
      where: { tenantId },
      include: { tratamiento: true },
      orderBy: { createdAt: 'desc' },
    });

    const cumplimiento =
      data.length > 0
        ? Math.round(
            (data.filter((v) => v.veredicto === 'VALIDO').length /
              data.length) *
              100,
          )
        : 0;

    return { data, total: data.length, cumplimiento };
  }

  async validarPrincipio(
    tenantId: string,
    tratamientoId: string,
    veredicto: 'VALIDO' | 'INCONSISTENCIA' | 'BLOQUEADO',
    motivo: string | null,
    userId: string,
  ) {
    const tratamiento = await this.prisma.tratamiento.findFirst({
      where: { id: tratamientoId, tenantId },
    });
    if (!tratamiento) throw new NotFoundException('Tratamiento no encontrado');

    // RN-401: BLOQUEADO freezes the treatment
    if (veredicto === 'BLOQUEADO') {
      await this.prisma.tratamiento.update({
        where: { id: tratamientoId },
        data: {
          estado: 'CON_OBSERVACIONES',
          observacionesDpo: motivo ?? 'Principio bloqueado - tratamiento congelado',
        },
      });
    }

    return this.prisma.validacionPrincipio.create({
      data: {
        tenantId,
        tratamientoId,
        veredicto,
        motivo,
        validadoPor: userId,
        validadoAt: new Date(),
      },
    });
  }

  // ── Hallazgos de diseno (HD-xxx) ──

  async listHallazgos(tenantId: string) {
    const data = await this.prisma.hallazgo.findMany({
      where: { tenantId, faseOrigen: 4 },
      include: { norma: true },
      orderBy: { createdAt: 'desc' },
    });
    const abiertos = data.filter((h) => h.estado === 'ABIERTO').length;
    return { data, total: data.length, abiertos };
  }

  async createHallazgo(
    tenantId: string,
    data: {
      codigo: string;
      tipo: string;
      severidad: string;
      descripcion: string;
      normaId: string;
      documentoAfectado?: string;
      auditoriaId?: string;
    },
  ) {
    // RN-601: must link to norma
    if (!data.normaId) {
      throw new BadRequestException(
        'RN-601: El hallazgo debe estar vinculado a una norma',
      );
    }

    const norma = await this.prisma.norma.findUnique({
      where: { id: data.normaId },
    });
    if (!norma) throw new NotFoundException('Norma no encontrada');

    return this.prisma.hallazgo.create({
      data: {
        tenantId,
        codigo: data.codigo,
        tipo: data.tipo as any,
        severidad: data.severidad as any,
        descripcion: data.descripcion,
        normaId: data.normaId,
        documentoAfectado: data.documentoAfectado,
        auditoriaId: data.auditoriaId,
        faseOrigen: 4,
        estado: 'ABIERTO',
      },
    });
  }

  // ── Planes de accion ──

  async listPlanesAccion(tenantId: string) {
    const data = await this.prisma.planAccion.findMany({
      where: { tenantId },
      include: { brecha: true },
      orderBy: { plazo: 'asc' },
    });

    const now = new Date();
    const vencidos = data.filter(
      (p) => p.estado !== 'COMPLETADO' && p.plazo < now,
    ).length;

    return { data, total: data.length, vencidos };
  }

  async createPlanAccion(
    tenantId: string,
    data: {
      titulo: string;
      responsable: string;
      plazo: string;
      brechaRef?: string;
      hallazgoId?: string;
      brechaId?: string;
    },
  ) {
    return this.prisma.planAccion.create({
      data: {
        tenantId,
        titulo: data.titulo,
        responsable: data.responsable,
        plazo: new Date(data.plazo),
        brechaRef: data.brechaRef,
        hallazgoId: data.hallazgoId,
        brechaId: data.brechaId,
        estado: 'COMPROMETIDO',
      },
    });
  }
}
