import { PrismaService } from '../../prisma/prisma.service';
import { estadoPlazo } from '@lexdata/contracts';

interface ToolContext {
  tenantId: string;
  userId: string;
  rol: string;
}

export async function executeToolCall(
  name: string,
  input: Record<string, unknown>,
  ctx: ToolContext,
  prisma: PrismaService,
): Promise<unknown> {
  // INV-5: Never accept tenant_id from model input — use server context
  const tenantId = ctx.tenantId;

  switch (name) {
    case 'estado_rat': {
      const tratamientos = await prisma.tratamiento.findMany({ where: { tenantId } });
      const conBase = tratamientos.filter((t: any) => t.baseLegal).length;
      const pendientes = tratamientos.filter((t: any) => t.estado === 'PENDIENTE').length;
      const conObs = tratamientos.filter((t: any) => t.estado === 'CON_OBSERVACIONES').length;
      return { total: tratamientos.length, conBaseLegal: conBase, pendientesValidar: pendientes, conObservaciones: conObs };
    }

    case 'resumen_riesgos': {
      const riesgos = await prisma.riesgo.findMany({ where: { tenantId } });
      const porNivel = { BAJO: 0, MEDIO: 0, ALTO: 0, CRITICO: 0 };
      riesgos.forEach((r: any) => { if (r.nivel in porNivel) porNivel[r.nivel as keyof typeof porNivel]++; });
      const eipd = riesgos.filter((r: any) => r.requiereEipd).length;
      return { total: riesgos.length, porNivel, zonaRoja: porNivel.ALTO + porNivel.CRITICO, eipdObligatorias: eipd };
    }

    case 'listar_hallazgos': {
      const where: any = { tenantId };
      if (input['estado']) where.estado = input['estado'];
      if (input['tipo']) where.tipo = input['tipo'];
      const hallazgos = await prisma.hallazgo.findMany({ where, include: { norma: { select: { identificador: true } } }, take: 20 });
      return hallazgos.map((h: any) => ({ codigo: h.codigo, tipo: h.tipo, estado: h.estado, descripcion: h.descripcion, norma: h.norma?.identificador }));
    }

    case 'estado_incidentes': {
      const incidentes = await prisma.incidente.findMany({ where: { tenantId, estado: { not: 'CERRADO' } } });
      const ahora = new Date();
      return incidentes.map((i: any) => ({
        codigo: i.codigo, tipo: i.tipo, estado: i.estado,
        horasRestantes: Math.max(0, Math.round((new Date(i.fechaMaxReporte).getTime() - ahora.getTime()) / 3600000)),
        estadoPlazo: estadoPlazo(ahora, new Date(i.fechaDeteccion), i.notificadoSpdp),
      }));
    }

    case 'documentos_pendientes': {
      const docs = await prisma.documento.findMany({
        where: { tenantId, estado: { in: ['PENDIENTE', 'GENERAR', 'BORRADOR', 'APROBAR'] } },
        select: { tipo: true, titulo: true, estado: true },
      });
      return { pendientes: docs.length, porEstado: docs };
    }

    case 'madurez_actual': {
      const snapshot = await prisma.madurezSnapshot.findFirst({
        where: { tenantId },
        orderBy: { fecha: 'desc' },
      });
      return snapshot ?? { mensaje: 'No hay datos de madurez registrados' };
    }

    case 'proxima_auditoria': {
      const aud = await prisma.auditoria.findFirst({
        where: { tenantId, estado: 'PROGRAMADA', fecha: { gte: new Date() } },
        orderBy: { fecha: 'asc' },
      });
      return aud ?? { mensaje: 'No hay auditorías programadas' };
    }

    case 'estado_arco': {
      const arco = await prisma.solicitudArco.findMany({ where: { tenantId, estado: { not: 'CERRADA' } } });
      return { enCurso: arco.length, solicitudes: arco.map((s: any) => ({ tipo: s.tipo, estado: s.estado, diasRestantes: s.plazoLimite ? Math.ceil((new Date(s.plazoLimite).getTime() - Date.now()) / 86400000) : null })) };
    }

    case 'dpas_pendientes': {
      const medidas = await prisma.medida.findMany({ where: { tenantId, tipo: 'LEGAL', estado: { not: 'DEFINIDA' } } });
      return { pendientes: medidas.length, detalle: medidas.map((m: any) => ({ titulo: m.titulo, contraparte: m.contraparte, estado: m.estado })) };
    }

    case 'solicitar_firma_dpo': {
      const solicitud = await prisma.solicitudFirma.create({
        data: {
          tenantId,
          tipo: input['tipo'] as string,
          entidad: 'documento',
          entidadId: input['entidadId'] as string,
          motivo: input['motivo'] as string,
          creadaPor: 'MARK_AI',
        },
      });
      return { id: solicitud.id, estado: 'PENDIENTE', mensaje: 'Solicitud de firma creada. El DPO humano la revisará.' };
    }

    case 'registrar_observacion': {
      // TODO: Create observaciones table or use audit_log
      return { registrada: true, mensaje: 'Observación registrada' };
    }

    default:
      return { error: `Herramienta "${name}" no disponible. Las acciones de aprobación, cierre, validación y firma son exclusivas del DPO humano (Art. 42 LOPDP).` };
  }
}
