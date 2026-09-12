import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnprocessableEntityException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { fechaMaxReporte, estadoPlazo } from '@lexdata/contracts';

@Injectable()
export class Fase6Service {
  constructor(private readonly prisma: PrismaService) {}

  // ── Centro de monitoreo (vista consolidada) ──

  async centroMonitoreo(tenantId: string) {
    const [
      hallazgosAbiertos,
      hallazgosTotal,
      incidentesActivos,
      incidentesTotal,
      auditorias,
      controlesImpl,
      arcoAbiertas,
      kpiSnapshots,
    ] = await Promise.all([
      this.prisma.hallazgo.count({ where: { tenantId, estado: 'ABIERTO' } }),
      this.prisma.hallazgo.count({ where: { tenantId } }),
      this.prisma.incidente.count({
        where: { tenantId, estado: { not: 'CERRADO' } },
      }),
      this.prisma.incidente.count({ where: { tenantId } }),
      this.prisma.auditoria.findMany({
        where: { tenantId },
        orderBy: { fecha: 'desc' },
        take: 5,
      }),
      this.prisma.control.count({
        where: { tenantId, estado: 'IMPLEMENTADO' },
      }),
      this.prisma.solicitudArco.count({
        where: { tenantId, estado: { not: 'RESPONDIDA' } },
      }),
      this.prisma.kpiSnapshot.findMany({
        where: { tenantId },
        orderBy: { fecha: 'desc' },
        take: 9,
        distinct: ['clave'],
      }),
    ]);

    const ultimaAuditoria = auditorias[0] ?? null;
    const cumplimientoAuditoria = ultimaAuditoria?.cumplimientoPct ?? 0;

    return {
      kpis: {
        hallazgosAbiertos,
        hallazgosTotal,
        incidentesActivos,
        cumplimientoAuditoria,
      },
      tarjetas: {
        auditorias: auditorias.length,
        controlesImplementados: controlesImpl,
        incidentesTotal,
        arcoAbiertas,
        hallazgosTotal,
        hallazgosAbiertos,
        ultimaAuditoria,
        kpiSnapshots,
      },
    };
  }

  // ── Auditorias ──

  async listAuditorias(tenantId: string) {
    const data = await this.prisma.auditoria.findMany({
      where: { tenantId },
      orderBy: { fecha: 'desc' },
      include: {
        hallazgos: { select: { id: true, estado: true } },
        checklistRespuestas: { select: { id: true } },
      },
    });
    return { data, total: data.length };
  }

  async createAuditoria(
    tenantId: string,
    data: {
      codigo: string;
      tipo: 'INTERNA' | 'EXTERNA';
      objetivo: string;
      responsable: string;
      fecha: string;
    },
  ) {
    return this.prisma.auditoria.create({
      data: {
        tenantId,
        codigo: data.codigo,
        tipo: data.tipo as any,
        objetivo: data.objetivo,
        responsable: data.responsable,
        fecha: new Date(data.fecha),
        estado: 'PROGRAMADA',
      },
    });
  }

  // ── Checklist ──

  async listChecklist(tenantId: string, perfil?: string) {
    const where: any = {};
    if (perfil) where.perfil = perfil;

    const items = await this.prisma.checklistItem.findMany({
      where,
      orderBy: { orden: 'asc' },
      include: {
        respuestas: { where: { tenantId } },
      },
    });

    const data = items.map((item) => ({
      id: item.id,
      perfil: item.perfil,
      orden: item.orden,
      pregunta: item.pregunta,
      baseNormativa: item.baseNormativa,
      respuesta: item.respuestas[0]?.respuesta ?? null,
      evidenciaId: item.respuestas[0]?.evidenciaId ?? null,
    }));

    const respondidos = data.filter((i) => i.respuesta !== null).length;

    return { data, total: data.length, respondidos };
  }

  async responderChecklist(
    tenantId: string,
    itemId: string,
    respuesta: 'CUMPLE' | 'NO_CUMPLE' | 'PARCIAL' | 'NO_APLICA',
    auditoriaId?: string,
  ) {
    const item = await this.prisma.checklistItem.findUnique({
      where: { id: itemId },
    });
    if (!item) throw new NotFoundException('Checklist item no encontrado');

    // Prisma composite unique with nullable auditoriaId requires manual check
    const existing = await this.prisma.checklistRespuesta.findFirst({
      where: {
        tenantId,
        itemId,
        auditoriaId: auditoriaId ?? null,
      },
    });

    if (existing) {
      return this.prisma.checklistRespuesta.update({
        where: { id: existing.id },
        data: { respuesta: respuesta as any, respondidoAt: new Date() },
      });
    }

    return this.prisma.checklistRespuesta.create({
      data: {
        tenantId,
        auditoriaId: auditoriaId ?? null,
        itemId,
        respuesta: respuesta as any,
      },
    });
  }

  // ── Hallazgos (con trazabilidad) ──

  async listHallazgos(tenantId: string) {
    const data = await this.prisma.hallazgo.findMany({
      where: { tenantId },
      include: {
        norma: { select: { id: true, codigo: true, titulo: true } },
        auditoria: { select: { id: true, codigo: true } },
        recomendaciones: {
          select: { id: true, codigo: true, estado: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    const abiertos = data.filter((h) => h.estado === 'ABIERTO').length;
    return { data, total: data.length, abiertos };
  }

  async cerrarHallazgo(
    tenantId: string,
    id: string,
    hashEvidencia: string,
    userId: string,
  ) {
    // RN-702: requires DPO_HUMANO + evidence hash
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId },
    });
    if (!user || user.rol !== 'DPO_HUMANO') {
      throw new ForbiddenException(
        'RN-702: Solo el DPO humano puede cerrar hallazgos',
      );
    }

    if (!hashEvidencia) {
      throw new UnprocessableEntityException(
        'RN-702: Se requiere hash de evidencia para cerrar hallazgo',
      );
    }

    const hallazgo = await this.prisma.hallazgo.findFirst({
      where: { id, tenantId },
    });
    if (!hallazgo) throw new NotFoundException('Hallazgo no encontrado');

    return this.prisma.hallazgo.update({
      where: { id },
      data: {
        estado: 'CERRADO',
        cerradoPor: userId,
        cerradoAt: new Date(),
        hashEvidenciaCierre: hashEvidencia,
      },
    });
  }

  // ── Sugerir norma ──

  async sugerirNorma(texto: string) {
    // RN-601: search corpus for matching articles
    if (!texto || texto.trim().length < 3) {
      return { sugerencias: [] };
    }

    const normas = await this.prisma.norma.findMany({
      where: {
        OR: [
          { titulo: { contains: texto, mode: 'insensitive' } },
          { resumenEjecutivo: { contains: texto, mode: 'insensitive' } },
          { categoria: { contains: texto, mode: 'insensitive' } },
          { codigo: { contains: texto, mode: 'insensitive' } },
        ],
      },
      take: 10,
      select: {
        id: true,
        codigo: true,
        titulo: true,
        identificador: true,
        fuente: true,
        resumenEjecutivo: true,
      },
    });

    return { sugerencias: normas };
  }

  // ── Incidentes ──

  async listIncidentes(tenantId: string) {
    const raw = await this.prisma.incidente.findMany({
      where: { tenantId },
      include: { tratamiento: true, activo: true },
      orderBy: { fechaDeteccion: 'desc' },
    });

    const ahora = new Date();

    // RN-602 / INV-9: compute 72h clock status
    const data = raw.map((inc) => ({
      ...inc,
      estadoPlazo: estadoPlazo(
        ahora,
        inc.fechaDeteccion,
        inc.notificadoSpdp,
      ),
      horasRestantes: Math.max(
        0,
        Math.round(
          (inc.fechaMaxReporte.getTime() - ahora.getTime()) / (1000 * 60 * 60),
        ),
      ),
    }));

    const porVencer = data.filter((i) => i.estadoPlazo === 'POR_VENCER').length;
    const vencidos = data.filter((i) => i.estadoPlazo === 'VENCIDO').length;

    return { data, total: data.length, porVencer, vencidos };
  }

  async createIncidente(
    tenantId: string,
    data: {
      codigo: string;
      tipo: 'CONFIDENCIALIDAD' | 'INTEGRIDAD' | 'DISPONIBILIDAD';
      descripcion: string;
      fechaDeteccion: string;
      tratamientoId?: string;
      activoId?: string;
    },
  ) {
    const deteccion = new Date(data.fechaDeteccion);
    // Server-side calculation of fechaMaxReporte (72h from detection)
    const maxReporte = fechaMaxReporte(deteccion);

    return this.prisma.incidente.create({
      data: {
        tenantId,
        codigo: data.codigo,
        tipo: data.tipo as any,
        descripcion: data.descripcion,
        fechaDeteccion: deteccion,
        fechaMaxReporte: maxReporte,
        tratamientoId: data.tratamientoId,
        activoId: data.activoId,
        estado: 'DETECTADO',
      },
    });
  }

  async notificarSpdp(
    tenantId: string,
    id: string,
    data: { titularesComunicados?: boolean },
  ) {
    const incidente = await this.prisma.incidente.findFirst({
      where: { id, tenantId },
    });
    if (!incidente) throw new NotFoundException('Incidente no encontrado');

    return this.prisma.incidente.update({
      where: { id },
      data: {
        notificadoSpdp: true,
        fechaNotificacion: new Date(),
        estado: 'NOTIFICADO_SPDP',
        titularesComunicados: data.titularesComunicados ?? false,
      },
    });
  }

  // ── ARCO ──

  async listArco(tenantId: string) {
    const data = await this.prisma.solicitudArco.findMany({
      where: { tenantId },
      include: { tratamiento: true },
      orderBy: { recibidaAt: 'desc' },
    });

    const ahora = new Date();
    const result = data.map((s) => ({
      ...s,
      diasRestantes: Math.max(
        0,
        Math.ceil(
          (s.plazoLimite.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24),
        ),
      ),
      vencida: s.plazoLimite < ahora && s.estado !== 'RESPONDIDA',
    }));

    return { data: result, total: result.length };
  }

  // ── Indicadores (9 KPIs from spec 8.5) ──

  async indicadores(tenantId: string) {
    const [
      hallazgosAbiertos,
      hallazgosTotal,
      hallazgosCerrados,
      incidentesTotal,
      incidentesNotificados,
      controlesTotal,
      controlesEficaces,
      arcoTotal,
      arcoRespondidas,
      auditoriasCount,
      brechasAbiertas,
    ] = await Promise.all([
      this.prisma.hallazgo.count({ where: { tenantId, estado: 'ABIERTO' } }),
      this.prisma.hallazgo.count({ where: { tenantId } }),
      this.prisma.hallazgo.count({ where: { tenantId, estado: 'CERRADO' } }),
      this.prisma.incidente.count({ where: { tenantId } }),
      this.prisma.incidente.count({
        where: { tenantId, notificadoSpdp: true },
      }),
      this.prisma.control.count({ where: { tenantId } }),
      this.prisma.control.count({
        where: { tenantId, eficacia: 'ALTA' },
      }),
      this.prisma.solicitudArco.count({ where: { tenantId } }),
      this.prisma.solicitudArco.count({
        where: { tenantId, estado: 'RESPONDIDA' },
      }),
      this.prisma.auditoria.count({ where: { tenantId } }),
      this.prisma.brecha.count({
        where: { tenantId, estado: 'ABIERTA' },
      }),
    ]);

    const pctCierre =
      hallazgosTotal > 0
        ? Math.round((hallazgosCerrados / hallazgosTotal) * 100)
        : 0;
    const pctNotificacion =
      incidentesTotal > 0
        ? Math.round((incidentesNotificados / incidentesTotal) * 100)
        : 100;
    const pctEficacia =
      controlesTotal > 0
        ? Math.round((controlesEficaces / controlesTotal) * 100)
        : 0;
    const pctArco =
      arcoTotal > 0
        ? Math.round((arcoRespondidas / arcoTotal) * 100)
        : 100;

    return {
      indicadores: [
        { clave: 'HALLAZGOS_ABIERTOS', valor: hallazgosAbiertos, meta: 0 },
        { clave: 'PCT_CIERRE_HALLAZGOS', valor: pctCierre, meta: 100 },
        { clave: 'INCIDENTES_TOTAL', valor: incidentesTotal, meta: null },
        { clave: 'PCT_NOTIFICACION_72H', valor: pctNotificacion, meta: 100 },
        { clave: 'PCT_EFICACIA_CONTROLES', valor: pctEficacia, meta: 80 },
        { clave: 'ARCO_RESPONDIDAS_PCT', valor: pctArco, meta: 100 },
        { clave: 'AUDITORIAS_REALIZADAS', valor: auditoriasCount, meta: null },
        { clave: 'BRECHAS_ABIERTAS', valor: brechasAbiertas, meta: 0 },
        { clave: 'CONTROLES_TOTAL', valor: controlesTotal, meta: null },
      ],
    };
  }
}
