import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class Fase5Service {
  constructor(private readonly prisma: PrismaService) {}

  // ── Controles implementados ──

  async listControles(tenantId: string) {
    const data = await this.prisma.control.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        norma: true,
        evidencias: { select: { id: true } },
      },
    });

    const result = data.map((c) => ({
      ...c,
      evidenciaCount: c.evidencias.length,
    }));

    const sinEvidencia = result.filter(
      (c) => c.estado === 'IMPLEMENTADO' && c.evidenciaCount === 0,
    ).length;

    return { data: result, total: result.length, sinEvidencia };
  }

  // ── Evaluar eficacia ──

  async evaluarEficacia(
    tenantId: string,
    controlId: string,
    data: {
      eficacia: 'ALTA' | 'MEDIA' | 'BAJA';
      confianzaEvidencia: 'ALTA' | 'MEDIA' | 'BAJA';
      suficiencia: 'SUFICIENTE' | 'PROPORCIONAL' | 'INSUFICIENTE';
    },
    userId: string,
  ) {
    const control = await this.prisma.control.findFirst({
      where: { id: controlId, tenantId },
      include: { evidencias: { select: { id: true } } },
    });
    if (!control) throw new NotFoundException('Control no encontrado');

    // RN-501: 3 axes evaluation. If eficacia=ALTA but no evidence, reject with 422
    if (data.eficacia === 'ALTA' && control.evidencias.length === 0) {
      throw new UnprocessableEntityException(
        'RN-501: No se puede calificar eficacia ALTA sin evidencia asociada al control',
      );
    }

    return this.prisma.control.update({
      where: { id: controlId },
      data: {
        eficacia: data.eficacia as any,
        confianzaEvidencia: data.confianzaEvidencia as any,
        suficiencia: data.suficiencia as any,
        calificadoPor: userId,
        calificadoAt: new Date(),
      },
    });
  }

  // ── Hallazgos operacionales (H-xxx) ──

  async listHallazgos(tenantId: string) {
    const data = await this.prisma.hallazgo.findMany({
      where: { tenantId, faseOrigen: 5 },
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
        faseOrigen: 5,
        estado: 'ABIERTO',
      },
    });
  }

  // ── Contadores badge ──

  async contadoresBadge(tenantId: string) {
    const hallazgosAbiertos = await this.prisma.hallazgo.count({
      where: { tenantId, faseOrigen: 5, estado: 'ABIERTO' },
    });

    const controlesImpl = await this.prisma.control.findMany({
      where: { tenantId, estado: 'IMPLEMENTADO' },
      include: { evidencias: { select: { id: true } } },
    });
    const controlesSinEvidencia = controlesImpl.filter(
      (c) => c.evidencias.length === 0,
    ).length;

    return { hallazgosAbiertos, controlesSinEvidencia };
  }
}
