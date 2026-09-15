import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { calcularRiesgoPerfil } from '@lexdata/contracts';

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string) {
    return this.prisma.cliente.findMany({
      where: { tenantId },
      select: { id: true, razonSocial: true, ruc: true, sector: true, ciudad: true, nivelRiesgo: true },
      orderBy: { razonSocial: 'asc' },
    });
  }

  async getById(tenantId: string, id: string) {
    const cliente = await this.prisma.cliente.findFirst({ where: { id, tenantId } });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');
    return cliente;
  }

  async create(tenantId: string, data: any) {
    const riesgo = this.calcularRiesgo(data);
    return this.prisma.cliente.create({
      data: { ...data, tenantId, nivelRiesgo: riesgo.nivel, pdScore: riesgo.puntaje },
    });
  }

  async update(tenantId: string, id: string, data: any) {
    const existing = await this.prisma.cliente.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Cliente no encontrado');

    const merged = { ...existing, ...data };
    const riesgo = this.calcularRiesgo(merged);

    return this.prisma.cliente.update({
      where: { id },
      data: { ...data, nivelRiesgo: riesgo.nivel, pdScore: riesgo.puntaje },
    });
  }

  async getResumen(tenantId: string, clienteId: string) {
    const cliente = await this.getById(tenantId, clienteId);

    // Scope all metrics by clienteId (via tratamiento.clienteId relation)
    const tratamientoWhere = { tenantId, clienteId };
    const riesgoWhere = { tenantId, tratamiento: { clienteId } };

    const [tratamientos, riesgos, hallazgos, controles, recomendaciones, incidentes] = await Promise.all([
      this.prisma.tratamiento.count({ where: tratamientoWhere }),
      this.prisma.riesgo.findMany({ where: riesgoWhere, select: { nivel: true } }),
      this.prisma.hallazgo.count({ where: { tenantId, estado: { not: 'CERRADO' } } }),
      this.prisma.control.findMany({ where: { tenantId }, select: { estado: true } }),
      this.prisma.recomendacion.count({ where: { tenantId, estado: { not: 'CERRADA' } } }),
      this.prisma.incidente.count({ where: { tenantId } }),
    ]);

    const riesgosCriticos = riesgos.filter(r => r.nivel === 'CRITICO').length;
    const riesgosAltos = riesgos.filter(r => r.nivel === 'ALTO').length;
    const controlesImpl = controles.filter(c => c.estado === 'IMPLEMENTADO').length;

    return {
      cliente,
      kpis: {
        tratamientos,
        riesgosTotal: riesgos.length,
        riesgosCriticos,
        riesgosAltos,
        hallazgosAbiertos: hallazgos,
        controlesImplementados: controlesImpl,
        controlesTotales: controles.length,
        recomendacionesActivas: recomendaciones,
        incidentes,
      },
    };
  }

  async getDerivacionDocumental(tenantId: string, clienteId: string) {
    const cliente = await this.getById(tenantId, clienteId);
    const docs = this.derivarDocumentos(cliente);

    // Check which documents exist
    const existentes = await this.prisma.documento.findMany({
      where: { tenantId },
      select: { tipo: true, estado: true },
    });

    return docs.map(doc => {
      const found = existentes.find(e => e.tipo === doc.tipo);
      return { ...doc, estado: found?.estado ?? 'PENDIENTE' };
    });
  }

  private calcularRiesgo(cliente: any) {
    return calcularRiesgoPerfil({
      trataDatosSensibles: cliente.trataDatosSensibles ?? false,
      decisionesAutomatizadas: cliente.decisionesAutomatizadas ?? false,
      perfilamiento: cliente.perfilamiento ?? false,
      sector: cliente.sector ?? '',
      menoresEdad: cliente.menoresEdad ?? false,
      brechaPreviaReportada: cliente.brechaPreviaReportada ?? false,
      transferenciaInternacional: cliente.transferenciaInternacional ?? false,
      encargadoExterno: cliente.encargadoExterno ?? false,
      videovigilancia: cliente.videovigilancia ?? false,
    });
  }

  private derivarDocumentos(cliente: any) {
    const docs = [
      { tipo: 'POLITICA_PRIVACIDAD', titulo: 'Política de Protección de Datos', baseNormativa: 'Art. 10 LOPDP / ISO 27701 §5.2', obligatorio: true },
      { tipo: 'AVISO_PRIVACIDAD', titulo: 'Aviso de Privacidad', baseNormativa: 'Art. 13 LOPDP', obligatorio: true },
      { tipo: 'RAT', titulo: 'Registro de Actividades de Tratamiento', baseNormativa: 'Art. 51 LOPDP', obligatorio: true },
      { tipo: 'PROTOCOLO_BRECHAS', titulo: 'Protocolo de Notificación de Vulneraciones', baseNormativa: 'Arts. 43 y 46 LOPDP', obligatorio: true },
      { tipo: 'PROCEDIMIENTO_ARCO', titulo: 'Procedimiento de Atención de Derechos ARCO', baseNormativa: 'Art. 19-27 LOPDP', obligatorio: true },
      { tipo: 'ACTA_DPO', titulo: 'Acta de Designación del DPO', baseNormativa: 'Art. 42 LOPDP / Res. 2025-0028-R', obligatorio: true },
      { tipo: 'PLAN_CAPACITACION', titulo: 'Plan de Capacitación Anual', baseNormativa: 'Art. 30 LOPDP', obligatorio: true },
      { tipo: 'REGISTRO_CONSENTIMIENTOS', titulo: 'Registro de Consentimientos', baseNormativa: 'Art. 7 LOPDP', obligatorio: true },
    ];

    // Conditional documents based on client profile
    if (cliente.transferenciaInternacional) {
      docs.push({ tipo: 'SCCS', titulo: 'Cláusulas Contractuales Tipo (SCCs)', baseNormativa: 'Art. 54 LOPDP', obligatorio: true });
    }
    if (cliente.encargadoExterno) {
      docs.push({ tipo: 'DPA', titulo: `DPA — ${cliente.nombreEncargado || 'Encargado'}`, baseNormativa: 'Art. 38 LOPDP', obligatorio: true });
    }

    // EIPD for high-risk treatments
    const needsEipd = cliente.trataDatosSensibles || cliente.menoresEdad || cliente.decisionesAutomatizadas || cliente.perfilamiento;
    if (needsEipd) {
      docs.push({ tipo: 'EIPD', titulo: 'Evaluación de Impacto en Protección de Datos', baseNormativa: 'Art. 42 LOPDP', obligatorio: true });
    }

    return docs;
  }
}
