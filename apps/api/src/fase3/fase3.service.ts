import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class Fase3Service {
  constructor(private readonly prisma: PrismaService) {}

  // ── Diagnostico ──

  async listDiagnostico(tenantId: string) {
    const dimensiones = await this.prisma.diagnosticoDimension.findMany({
      orderBy: { orden: 'asc' },
      include: {
        preguntas: {
          where: {
            OR: [{ tenantId: null }, { tenantId }],
          },
          orderBy: { orden: 'asc' },
          include: {
            respuestas: { where: { tenantId } },
          },
        },
      },
    });

    let totalPreguntas = 0;
    let respondidas = 0;

    const data = dimensiones.map((dim) => {
      const preguntas = dim.preguntas.map((p) => {
        totalPreguntas++;
        const resp = p.respuestas[0] ?? null;
        if (resp) respondidas++;
        return {
          id: p.id,
          enunciado: p.enunciado,
          baseNormativa: p.baseNormativa,
          creadaPorDpo: p.creadaPorDpo,
          respuesta: resp?.respuesta ?? null,
          respondidoAt: resp?.respondidoAt ?? null,
        };
      });
      return { id: dim.id, nombre: dim.nombre, orden: dim.orden, preguntas };
    });

    const progreso = totalPreguntas > 0 ? Math.round((respondidas / totalPreguntas) * 100) : 0;

    return { data, totalPreguntas, respondidas, progreso };
  }

  async responderDiagnostico(
    tenantId: string,
    preguntaId: string,
    respuesta: 'CUMPLE' | 'PARCIAL' | 'NO_CUMPLE',
    userId: string,
  ) {
    const pregunta = await this.prisma.diagnosticoPregunta.findFirst({
      where: {
        id: preguntaId,
        OR: [{ tenantId: null }, { tenantId }],
      },
    });
    if (!pregunta) throw new NotFoundException('Pregunta no encontrada');

    return this.prisma.diagnosticoRespuesta.upsert({
      where: { tenantId_preguntaId: { tenantId, preguntaId } },
      create: {
        tenantId,
        preguntaId,
        respuesta: respuesta as any,
        respondidoPor: userId,
        respondidoAt: new Date(),
      },
      update: {
        respuesta: respuesta as any,
        respondidoPor: userId,
        respondidoAt: new Date(),
      },
    });
  }

  async addPregunta(
    tenantId: string,
    dimensionId: string,
    enunciado: string,
    baseNormativa: string,
  ) {
    const dimension = await this.prisma.diagnosticoDimension.findUnique({
      where: { id: dimensionId },
    });
    if (!dimension) throw new NotFoundException('Dimension no encontrada');

    const maxOrden = await this.prisma.diagnosticoPregunta.findFirst({
      where: { dimensionId },
      orderBy: { orden: 'desc' },
      select: { orden: true },
    });

    return this.prisma.diagnosticoPregunta.create({
      data: {
        dimensionId,
        orden: (maxOrden?.orden ?? 0) + 1,
        enunciado,
        baseNormativa,
        creadaPorDpo: true,
        tenantId,
      },
    });
  }

  // ── Gobierno ──

  async listGobierno(tenantId: string) {
    const items = await this.prisma.gobiernoItem.findMany({
      where: { tenantId },
      orderBy: { nombre: 'asc' },
    });
    const verificados = items.filter((i) => i.verificado).length;
    return { data: items, total: items.length, verificados };
  }

  // ── Roles ──

  async listRoles(tenantId: string) {
    const roles = await this.prisma.rolSgpdp.findMany({
      where: { tenantId },
      orderBy: { nombre: 'asc' },
    });

    // RN-402: roles that require acta must have hashActa to be DEFINIDO
    const data = roles.map((r) => ({
      ...r,
      actaVerificada: r.requiereActa ? !!r.hashActa : true,
    }));

    return { data, total: data.length };
  }

  // ── Recursos ──

  async listRecursos(tenantId: string) {
    // RN-902: observational only — no writes, just listing with evaluation status
    const recursos = await this.prisma.recursoEvaluacion.findMany({
      where: { tenantId },
      orderBy: { categoria: 'asc' },
    });
    return { data: recursos, total: recursos.length };
  }

  // ── Brechas ──

  async listBrechas(tenantId: string) {
    const brechas = await this.prisma.brecha.findMany({
      where: { tenantId },
      orderBy: { detectadaAt: 'desc' },
      include: { planesAccion: true },
    });
    const abiertas = brechas.filter((b) => b.estado === 'ABIERTA').length;
    return { data: brechas, total: brechas.length, abiertas };
  }

  // ── Recomendaciones (fase 3 scope) ──

  async listRecomendaciones(tenantId: string) {
    const data = await this.prisma.recomendacion.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: { origenHallazgo: true },
    });
    return { data, total: data.length };
  }

  // ── Verificar eficacia de recomendacion ──

  async verificarEficacia(
    tenantId: string,
    recomendacionId: string,
    hashEvidencia: string,
    userId: string,
  ) {
    // RN-702: only DPO_HUMANO can verify, requires evidence hash
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
      where: { id: recomendacionId, tenantId },
    });
    if (!rec) throw new NotFoundException('Recomendacion no encontrada');

    return this.prisma.recomendacion.update({
      where: { id: recomendacionId },
      data: {
        estado: 'VERIFICADO',
        verificadoPor: userId,
        verificadoAt: new Date(),
        hashEvidencia,
      },
    });
  }

  // ── Informe ejecutivo ──

  async informeEjecutivo(tenantId: string) {
    const [diagnostico, gobierno, roles, brechas, recursos] =
      await Promise.all([
        this.listDiagnostico(tenantId),
        this.listGobierno(tenantId),
        this.listRoles(tenantId),
        this.listBrechas(tenantId),
        this.listRecursos(tenantId),
      ]);

    const rolesDefinidos = roles.data.filter(
      (r) => r.estado === 'DEFINIDO',
    ).length;

    return {
      progresoDiagnostico: diagnostico.progreso,
      totalPreguntas: diagnostico.totalPreguntas,
      respondidas: diagnostico.respondidas,
      gobiernoVerificados: gobierno.verificados,
      gobiernoTotal: gobierno.total,
      rolesDefinidos,
      rolesTotal: roles.total,
      brechasAbiertas: brechas.abiertas,
      brechasTotal: brechas.total,
      recursosTotal: recursos.total,
    };
  }
}
