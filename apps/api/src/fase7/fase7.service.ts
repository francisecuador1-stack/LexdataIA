import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { calcularMadurezGlobal, madurezPorFase } from '@lexdata/contracts';

@Injectable()
export class Fase7Service {
  constructor(private readonly prisma: PrismaService) {}

  // ── Recomendaciones ──

  async listRecomendaciones(tenantId: string) {
    const data = await this.prisma.recomendacion.findMany({
      where: { tenantId },
      include: {
        origenHallazgo: {
          select: { id: true, codigo: true, descripcion: true },
        },
        accionesCorrectivas: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const porEstado = {
      emitidas: data.filter((r) => r.estado === 'EMITIDA').length,
      enProceso: data.filter((r) => r.estado === 'EN_PROCESO').length,
      implementadas: data.filter((r) => r.estado === 'IMPLEMENTADA').length,
      verificadas: data.filter((r) => r.estado === 'VERIFICADO').length,
      cerradas: data.filter((r) => r.estado === 'CERRADA').length,
    };

    return { data, total: data.length, porEstado };
  }

  // ── Verificar eficacia ──

  async verificarEficacia(
    tenantId: string,
    id: string,
    hashEvidencia: string,
    userId: string,
  ) {
    // RN-702: only DPO_HUMANO, requires evidence hash
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId },
    });
    if (!user || user.rol !== 'DPO_HUMANO') {
      throw new ForbiddenException(
        'RN-702: Solo el DPO humano puede verificar eficacia',
      );
    }

    if (!hashEvidencia) {
      throw new UnprocessableEntityException(
        'RN-702: Se requiere hash de evidencia para verificar',
      );
    }

    const rec = await this.prisma.recomendacion.findFirst({
      where: { id, tenantId },
    });
    if (!rec) throw new NotFoundException('Recomendacion no encontrada');

    return this.prisma.recomendacion.update({
      where: { id },
      data: {
        estado: 'VERIFICADO',
        verificadoPor: userId,
        verificadoAt: new Date(),
        hashEvidencia,
      },
    });
  }

  // ── Madurez ──

  async madurez(tenantId: string) {
    // Gather latest madurez snapshot per fase
    const snapshots = await this.prisma.madurezSnapshot.findMany({
      where: { tenantId },
      orderBy: { fecha: 'desc' },
      distinct: ['fase'],
    });

    // Build input from snapshots (default 0 for missing fases)
    const porcentajes: Record<string, number> = {};
    for (const s of snapshots) {
      porcentajes[`f${s.fase}`] = s.porcentaje;
    }

    const input = {
      f1: porcentajes['f1'] ?? 0,
      f2: porcentajes['f2'] ?? 0,
      f3: porcentajes['f3'] ?? 0,
      f4: porcentajes['f4'] ?? 0,
      f5: porcentajes['f5'] ?? 0,
      f6: porcentajes['f6'] ?? 0,
      f7: porcentajes['f7'] ?? 0,
    };

    // RN-701: use calculation engines
    const global = calcularMadurezGlobal(input);
    const fases = madurezPorFase(input);

    return { global, fases, ultimaActualizacion: snapshots[0]?.fecha ?? null };
  }

  // ── Lecciones aprendidas ──

  async listLecciones(tenantId: string) {
    const data = await this.prisma.leccion.findMany({
      where: { tenantId },
      orderBy: { fecha: 'desc' },
    });
    return { data, total: data.length };
  }

  async createLeccion(
    tenantId: string,
    data: {
      tipo: 'HALLAZGO' | 'BUENA_PRACTICA';
      titulo: string;
      descripcion: string;
      areas: string[];
    },
  ) {
    return this.prisma.leccion.create({
      data: {
        tenantId,
        tipo: data.tipo,
        titulo: data.titulo,
        descripcion: data.descripcion,
        areas: data.areas,
        estado: 'DOCUMENTADA',
      },
    });
  }

  // ── Oportunidades de mejora ──

  async oportunidades(tenantId: string) {
    const data = await this.prisma.oportunidadMejora.findMany({
      where: { tenantId },
      orderBy: [{ impacto: 'desc' }, { faseOrigen: 'asc' }],
    });

    const pendientes = data.filter((o) => !o.aplicada).length;
    const aplicadas = data.filter((o) => o.aplicada).length;

    return { data, total: data.length, pendientes, aplicadas };
  }

  // ── Expediente de trazabilidad F1->F7 ──

  async expediente(tenantId: string, recomendacionId: string) {
    const rec = await this.prisma.recomendacion.findFirst({
      where: { id: recomendacionId, tenantId },
      include: {
        origenHallazgo: {
          include: {
            norma: { select: { id: true, codigo: true, titulo: true } },
            auditoria: { select: { id: true, codigo: true } },
          },
        },
        accionesCorrectivas: true,
      },
    });
    if (!rec) throw new NotFoundException('Recomendacion no encontrada');

    // Gather traceability across phases
    const [brechas, controles, evidencias, planesAccion] = await Promise.all([
      this.prisma.brecha.findMany({
        where: { tenantId },
        orderBy: { detectadaAt: 'desc' },
        take: 5,
      }),
      rec.origenHallazgo
        ? this.prisma.control.findMany({
            where: {
              tenantId,
              normaId: rec.origenHallazgo.normaId ?? undefined,
            },
            take: 5,
          })
        : [],
      this.prisma.evidencia.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          nombre: true,
          hashSha256: true,
          fase: true,
          createdAt: true,
        },
      }),
      this.prisma.planAccion.findMany({
        where: {
          tenantId,
          hallazgoId: rec.origenHallazgoId ?? undefined,
        },
      }),
    ]);

    return {
      recomendacion: rec,
      hallazgoOrigen: rec.origenHallazgo,
      normaVinculada: rec.origenHallazgo?.norma ?? null,
      auditoriaOrigen: rec.origenHallazgo?.auditoria ?? null,
      accionesCorrectivas: rec.accionesCorrectivas,
      controlesRelacionados: controles,
      brechasRelacionadas: brechas,
      evidencias,
      planesAccion,
    };
  }
}
