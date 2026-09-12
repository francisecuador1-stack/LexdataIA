import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { calcularScoreRiesgo, decidirEipd, calcularBrechaControles } from '@lexdata/contracts';

@Injectable()
export class Fase2Service {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // ── Tratamientos (RAT) ──

  async listTratamientos(tenantId: string) {
    const data = await this.prisma.tratamiento.findMany({
      where: { tenantId },
      orderBy: { codigoRat: 'asc' },
    });
    const validados = data.filter(t => t.estado === 'VALIDADO').length;
    const conObs = data.filter(t => t.estado === 'CON_OBSERVACIONES').length;
    return { data, total: data.length, validados, conObservaciones: conObs };
  }

  async createTratamiento(tenantId: string, data: {
    codigoRat: string; nombre: string; finalidad: string;
    baseLegal?: string; area?: string; datosSensibles?: boolean;
    categorias?: string[]; retencion?: string;
  }) {
    return this.prisma.tratamiento.create({
      data: { tenantId, ...data, estado: 'PENDIENTE' },
    });
  }

  async resolucionTratamiento(tenantId: string, id: string, userId: string, resolucion: {
    estado: 'VALIDADO' | 'CON_OBSERVACIONES'; observaciones?: string;
  }) {
    const tratamiento = await this.prisma.tratamiento.findFirst({ where: { id, tenantId } });
    if (!tratamiento) throw new NotFoundException('Tratamiento no encontrado');

    // RN-401: CON_OBSERVACIONES bloquea el avance
    return this.prisma.tratamiento.update({
      where: { id },
      data: {
        estado: resolucion.estado,
        observacionesDpo: resolucion.observaciones,
        validadoPor: userId,
        validadoAt: new Date(),
      },
    });
  }

  // ── Activos ──

  async listActivos(tenantId: string) {
    const data = await this.prisma.activo.findMany({ where: { tenantId }, orderBy: { nombre: 'asc' } });
    return { data, total: data.length };
  }

  async createActivo(tenantId: string, data: {
    nombre: string; tipo: string; criticidad: 'BAJA' | 'MEDIA' | 'ALTA';
    responsable: string; ubicacion: string; sistemas: string[];
    contienePersonales?: boolean;
  }) {
    return this.prisma.activo.create({ data: { tenantId, ...data } });
  }

  // ── Categorías de datos ──

  async listCategorias(tenantId: string) {
    return this.prisma.categoriaDatosTenant.findMany({
      where: { tenantId },
      include: { categoria: true },
    });
  }

  // ── Riesgos ──

  async listRiesgos(tenantId: string) {
    const data = await this.prisma.riesgo.findMany({
      where: { tenantId },
      include: { tratamiento: true, activo: true, amenaza: true },
      orderBy: { score: 'desc' },
    });
    return { data, total: data.length };
  }

  async createRiesgo(tenantId: string, data: {
    tratamientoId: string; activoId: string; amenazaId?: string;
    impacto: number; probabilidad: number; vulnerabilidadTexto?: string;
  }) {
    // RN-201: calculate score and level using the engine
    const { score, nivel, requiereEipd } = calcularScoreRiesgo(data.impacto, data.probabilidad);

    const riesgo = await this.prisma.riesgo.create({
      data: {
        tenantId,
        tratamientoId: data.tratamientoId,
        activoId: data.activoId,
        amenazaId: data.amenazaId,
        impacto: data.impacto,
        probabilidad: data.probabilidad,
        score,
        nivel: nivel as any,
        requiereEipd,
        vulnerabilidadTexto: data.vulnerabilidadTexto,
      },
    });

    // RN-201: if zona roja, create notification and mark EIPD obligatoria
    if (requiereEipd) {
      // TODO: emit event for notification to DPO
      // TODO: auto-create EIPD for the tratamiento if not exists
    }

    return riesgo;
  }

  async revisionDpo(tenantId: string, id: string, userId: string) {
    const riesgo = await this.prisma.riesgo.findFirst({ where: { id, tenantId } });
    if (!riesgo) throw new NotFoundException('Riesgo no encontrado');
    return this.prisma.riesgo.update({
      where: { id },
      data: { revisadoDpo: true, revisadoAt: new Date() },
    });
  }

  async indicadorRiesgo(tenantId: string) {
    const riesgos = await this.prisma.riesgo.findMany({ where: { tenantId } });
    if (riesgos.length === 0) return { probabilidadProyectada: 0, etiqueta: 'SIN DATOS' };

    const avgProb = riesgos.reduce((s, r) => s + r.probabilidad, 0) / riesgos.length;
    const pct = Math.round((avgProb / 5) * 100);
    const etiqueta = pct >= 65 ? 'RIESGO ALTO' : pct >= 35 ? 'RIESGO MEDIO' : 'RIESGO BAJO';
    return { probabilidadProyectada: pct, etiqueta, totalRiesgos: riesgos.length };
  }

  // ── Mapa de calor 5×5 ──

  async mapaCalor(tenantId: string) {
    const riesgos = await this.prisma.riesgo.findMany({
      where: { tenantId },
      include: { tratamiento: true, activo: true },
    });

    // Build 5×5 matrix
    const celdas: Array<{ impacto: number; probabilidad: number; count: number; riesgos: typeof riesgos }> = [];
    for (let i = 1; i <= 5; i++) {
      for (let p = 1; p <= 5; p++) {
        const matching = riesgos.filter(r => r.impacto === i && r.probabilidad === p);
        celdas.push({ impacto: i, probabilidad: p, count: matching.length, riesgos: matching });
      }
    }

    const requierenEipd = riesgos.filter(r => r.requiereEipd).length;
    const criticos = riesgos.filter(r => r.nivel === 'CRITICO').length;

    return { celdas, totalRiesgos: riesgos.length, requierenEipd, criticos };
  }

  // ── Matriz consolidada ──

  async matrizConsolidada(tenantId: string) {
    const data = await this.prisma.riesgo.findMany({
      where: { tenantId },
      include: { tratamiento: true, activo: true },
      orderBy: { score: 'desc' },
    });
    const revisados = data.filter(r => r.revisadoDpo).length;
    return { data, total: data.length, revisadosPorDpo: revisados };
  }

  // ── Brecha de controles ──

  async brechaControles(tenantId: string) {
    const controles = await this.prisma.control.findMany({ where: { tenantId } });

    const porCategoria = ['TECNICO', 'ORGANIZATIVO', 'LEGAL', 'DOCUMENTAL'].map(cat => {
      const del = controles.filter(c => c.tipo === cat);
      const impl = del.filter(c => c.estado === 'IMPLEMENTADO');
      return { categoria: cat === 'TECNICO' ? 'Técnicos' : cat === 'ORGANIZATIVO' ? 'Organizativos' : cat === 'LEGAL' ? 'Jurídicos' : 'Documentales', necesarios: del.length, implementados: impl.length };
    });

    return calcularBrechaControles(porCategoria);
  }

  // ── EIPD ──

  async listEipd(tenantId: string) {
    return this.prisma.evaluacionEipd.findMany({
      where: { tenantId },
      include: { tratamiento: true },
    });
  }

  async createEipd(tenantId: string, data: {
    tratamientoId: string; granEscala: boolean; sensibles: boolean;
    decisionesAuto: boolean; perfilamiento: boolean; menores: boolean;
  }) {
    const resultado = decidirEipd({
      granEscala: data.granEscala,
      datosSensibles: data.sensibles,
      decisionesAutomatizadas: data.decisionesAuto,
      perfilamiento: data.perfilamiento,
      menores: data.menores,
    });

    return this.prisma.evaluacionEipd.create({
      data: {
        tenantId,
        tratamientoId: data.tratamientoId,
        granEscala: data.granEscala,
        sensibles: data.sensibles,
        decisionesAuto: data.decisionesAuto,
        perfilamiento: data.perfilamiento,
        menores: data.menores,
        puntajeMtge: resultado.puntajeMtge,
        decision: resultado.decision,
      },
    });
  }

  // ── Reporte ejecutivo ──

  async reporteEjecutivo(tenantId: string) {
    const riesgos = await this.prisma.riesgo.findMany({
      where: { tenantId },
      include: { tratamiento: true },
      orderBy: { score: 'desc' },
    });

    const criticos = riesgos.filter(r => r.nivel === 'CRITICO').length;
    const altos = riesgos.filter(r => r.nivel === 'ALTO').length;
    const mitigados = riesgos.filter(r => r.estado === 'MITIGADO').length;
    const eipds = await this.prisma.evaluacionEipd.count({ where: { tenantId, decision: 'OBLIGATORIO' } });
    const activos = await this.prisma.activo.count({ where: { tenantId } });

    return {
      riesgosTotal: riesgos.length,
      criticos, altos, mitigados,
      eipdObligatorias: eipds,
      activosMapeados: activos,
      ranking: riesgos.slice(0, 5).map(r => ({
        tratamiento: r.tratamiento.nombre,
        score: r.score,
        scoreMax: 25,
        nivel: r.nivel,
      })),
    };
  }
}
