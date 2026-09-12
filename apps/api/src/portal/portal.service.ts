import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { calculatePdVar, determinarCaso, calcularCotizacion } from '@lexdata/contracts';

@Injectable()
export class PortalService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Diagnóstico PIMS ──

  async listPims(tenantId: string) {
    const modulos = await this.prisma.pimsModulo.findMany({
      include: {
        preguntas: {
          include: { respuestas: { where: { tenantId } } },
          orderBy: { orden: 'asc' },
        },
      },
      orderBy: { numero: 'asc' },
    });

    const respondidos = modulos.filter(m =>
      m.preguntas.every(p => p.respuestas.length > 0),
    ).length;

    return { modulos, progreso: respondidos, total: modulos.length };
  }

  async responderPims(tenantId: string, preguntaId: string, respuesta: string) {
    return this.prisma.pimsRespuesta.upsert({
      where: { tenantId_preguntaId: { tenantId, preguntaId } },
      create: { tenantId, preguntaId, respuesta: respuesta as any },
      update: { respuesta: respuesta as any, respondidoAt: new Date() },
    });
  }

  // ── Formulario SPDP + Pd-VaR (RN-901) ──

  async crearRegistro(datos: Record<string, unknown>) {
    // Run Pd-VaR engine
    const pdVarInput = {
      sector: (datos['sector'] as string) ?? '',
      trabajadores: (datos['trabajadores'] as string) ?? '1-9',
      sucursales: (datos['sucursales'] as string) ?? '1-3',
      volumenRegistros: (datos['volumenRegistros'] as string) ?? '<1000',
      categoriasTitulares: (datos['categoriasTitulares'] as string[]) ?? [],
      datosSalud: Boolean(datos['datosSalud']),
      datosBiometricos: Boolean(datos['datosBiometricos']),
      datosGeneticos: Boolean(datos['datosGeneticos']),
      datosMenores: Boolean(datos['datosMenores']),
      datosRaciales: Boolean(datos['datosRaciales']),
      datosPoliticos: Boolean(datos['datosPoliticos']),
      datosReligiosos: Boolean(datos['datosReligiosos']),
      datosSindicales: Boolean(datos['datosSindicales']),
      datosSexuales: Boolean(datos['datosSexuales']),
      datosPenales: Boolean(datos['datosPenales']),
      usaIA: Boolean(datos['usaIA']),
      decisionesAutomatizadas: Boolean(datos['decisionesAutomatizadas']),
      realizaPerfilamiento: Boolean(datos['realizaPerfilamiento']),
      transferenciasInternacionales: Boolean(datos['transferenciasInternacionales']),
      cloudExtranjero: Boolean(datos['cloudExtranjero']),
      tieneRAT: Boolean(datos['tieneRAT']),
      tieneEIPD: Boolean(datos['tieneEIPD']),
      tieneLIA: Boolean(datos['tieneLIA']),
      tienePoliticas: Boolean(datos['tienePoliticas']),
      tieneDPO: Boolean(datos['tieneDPO']),
      solicitudesARCO: (datos['solicitudesARCO'] as string) ?? '<10',
      incidentesAnuales: (datos['incidentesAnuales'] as string) ?? '0',
      compromisoDirectivo: Boolean(datos['compromisoDirectivo']),
      comitePrivacidad: Boolean(datos['comitePrivacidad']),
      antecedentesReclamos: Boolean(datos['antecedentesReclamos']),
      sancionesSPDP: Boolean(datos['sancionesSPDP']),
    };

    const pdVarResult = calculatePdVar(pdVarInput as any);
    const caso = determinarCaso(pdVarInput as any);
    const cotizacion = calcularCotizacion(pdVarInput as any, pdVarResult.nivelRiesgo);

    const estado = caso === 'A' ? 'LISTA_ESPERA' : 'NUEVA';

    const solicitud = await this.prisma.solicitudRegistro.create({
      data: {
        datos: datos as any,
        pdScore: pdVarResult.pdScore,
        nivelRiesgo: pdVarResult.nivelRiesgo as any,
        caso: caso as any,
        honorarioMensual: cotizacion.honorarioMensual,
        implementacionFee: cotizacion.implementacionFee,
        breakdown: pdVarResult.factors as any,
        declaracionVeracidad: Boolean(datos['declaracionVeracidad']),
        notaAdicional: datos['notaAdicional'] as string | undefined,
        estado,
      },
    });

    const proximosPasos = caso === 'B'
      ? [
          'Dra. Andreina Almeida revisará su perfil Pd-VaR en 24 horas hábiles',
          'Se iniciará el Diagnóstico LOPDP completo — Fase 1 · Normas aplicables',
          'Se generará el RAT, EIPD y documentación base del SGPDP',
          'Acceda al Dashboard LOPDP en el menú lateral izquierdo',
          'Primer reporte mensual al SPDP en el plazo reglamentario',
        ]
      : [
          'Su correo ha sido registrado en la lista de espera prioritaria',
          'Recibirá una notificación cuando el servicio de Implementación esté disponible',
          'Un asesor de LEXDATA IA se contactará con usted para orientarle',
        ];

    return {
      id: solicitud.id,
      pdScore: pdVarResult.pdScore,
      nivelRiesgo: pdVarResult.nivelRiesgo,
      caso,
      honorarioMensual: cotizacion.honorarioMensual,
      implementacionFee: cotizacion.implementacionFee,
      breakdown: pdVarResult.factors,
      proximosPasos,
    };
  }

  async getResultadoRegistro(id: string) {
    const solicitud = await this.prisma.solicitudRegistro.findUnique({ where: { id } });
    if (!solicitud) throw new NotFoundException('Solicitud no encontrada');
    return solicitud;
  }

  /** DPO converts a registration to a client and starts SGPDP */
  async convertirRegistro(id: string, tenantId: string) {
    const solicitud = await this.prisma.solicitudRegistro.findUnique({ where: { id } });
    if (!solicitud) throw new NotFoundException('Solicitud no encontrada');

    const datos = solicitud.datos as Record<string, unknown>;

    const cliente = await this.prisma.cliente.create({
      data: {
        tenantId,
        razonSocial: datos['razonSocial'] as string ?? '',
        ruc: datos['ruc'] as string ?? '',
        sector: datos['sector'] as string,
        ciudad: datos['ciudad'] as string,
        provincia: datos['provincia'] as string,
        empleados: datos['trabajadores'] as string,
        nivelRiesgo: solicitud.nivelRiesgo,
        pdScore: solicitud.pdScore,
      },
    });

    await this.prisma.solicitudRegistro.update({
      where: { id },
      data: { estado: 'CONVERTIDA', tenantId, clienteId: cliente.id },
    });

    return { clienteId: cliente.id, estado: 'CONVERTIDA' };
  }
}
