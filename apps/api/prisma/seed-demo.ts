/**
 * seed-demo.ts — DEMO CLINICA HORIZONTE S.A.
 *
 * Seeds a realistic demo enterprise with 10 tratamientos, 8 activos,
 * 10 riesgos, 3 incidentes, and 5 hallazgos.
 *
 * Prerequisites: run the main seed first (`pnpm db:reset` or `tsx prisma/seed.ts`)
 * so that the tenant "LEXDATA Demo" and the DPO user exist.
 *
 * Idempotent: uses upserts keyed on unique fields (ruc, codigoRat, codigo).
 * Safe to run multiple times.
 *
 * Usage: pnpm seed:demo
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Deterministic UUID helper — converts a DEMO-* key into a v5-style UUID
// using a simple hash so IDs are stable across runs.
// ---------------------------------------------------------------------------
function demoUuid(key: string): string {
  // Simple deterministic UUID from key — use a fixed namespace prefix
  const hex = Array.from(key)
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');
  const padded = hex.padEnd(32, '0').slice(0, 32);
  // Format as UUID v4 shape (the version nibble is overwritten for determinism)
  return [
    padded.slice(0, 8),
    padded.slice(8, 12),
    '4' + padded.slice(13, 16),
    '8' + padded.slice(17, 20),
    padded.slice(20, 32),
  ].join('-');
}

async function seedDemo() {
  console.log('Seeding DEMO CLINICA HORIZONTE S.A. ...');

  // ══════════════════════════════════════════════════════════
  // 0. Find existing tenant and DPO from main seed
  // ══════════════════════════════════════════════════════════

  const tenant = await prisma.tenant.findFirst({
    where: { nombre: 'LEXDATA Demo' },
  });
  if (!tenant) {
    throw new Error(
      'Tenant "LEXDATA Demo" not found. Run the main seed first (pnpm db:reset).',
    );
  }

  const dpo = await prisma.user.findFirst({
    where: { tenantId: tenant.id, rol: 'DPO_HUMANO' },
  });
  if (!dpo) {
    throw new Error(
      'DPO user not found for tenant. Run the main seed first.',
    );
  }

  const tenantId = tenant.id;

  // ══════════════════════════════════════════════════════════
  // 1. CLIENTE — DEMO CLINICA HORIZONTE S.A.
  // ══════════════════════════════════════════════════════════

  const cliente = await prisma.cliente.upsert({
    where: { ruc: '9999999999001' },
    update: {},
    create: {
      id: demoUuid('DEMO-CLIENTE-01'),
      tenantId,
      razonSocial: 'DEMO CLINICA HORIZONTE S.A.',
      ruc: '9999999999001',
      sector: 'Salud y Medicina',
      ciudad: 'Quito',
      provincia: 'Pichincha',
      empleados: '200+',
      trataDatosSensibles: true,
      tiposDatosSensibles: ['historias clínicas', 'datos biométricos'],
      menoresEdad: true,
      decisionesAutomatizadas: true,
      nivelRiesgo: 'CRITICO',
    },
  });
  console.log(`  Cliente: ${cliente.razonSocial} (${cliente.id})`);

  // ══════════════════════════════════════════════════════════
  // 2. TRATAMIENTOS (10)
  // ══════════════════════════════════════════════════════════

  const tratamientosData = [
    {
      key: 'DEMO-TRAT-01', codigoRat: 'DEMO-a1',
      nombre: 'Gestión de historia clínica electrónica',
      finalidad: 'Documentar la atención médica de los pacientes',
      baseLegal: 'Art. 7 LOPDP', area: 'Dirección Médica', datosSensibles: true,
      retencion: '10 años desde la última atención',
      categorias: ['Identificación', 'Contacto', 'Salud', 'Discapacidad'],
    },
    {
      key: 'DEMO-TRAT-02', codigoRat: 'DEMO-a2',
      nombre: 'Administración de nómina y talento humano',
      finalidad: 'Gestionar la relación laboral y cumplir obligaciones tributarias',
      baseLegal: 'Art. 7 LOPDP', area: 'RRHH', datosSensibles: false,
      retencion: '7 años desde terminación laboral',
      categorias: ['Identificación', 'Contacto', 'Laborales', 'Financieros'],
    },
    {
      key: 'DEMO-TRAT-03', codigoRat: 'DEMO-a3',
      nombre: 'Videovigilancia perimetral y control de accesos',
      finalidad: 'Garantizar la seguridad física de las instalaciones',
      baseLegal: 'Art. 7 LOPDP', area: 'Seguridad Física', datosSensibles: false,
      retencion: '30 días', categorias: ['Imagen y voz'],
    },
    {
      key: 'DEMO-TRAT-04', codigoRat: 'DEMO-a4',
      nombre: 'Gestión de citas y relación con pacientes (CRM)',
      finalidad: 'Administrar citas médicas y comunicación con pacientes',
      baseLegal: 'Art. 7 LOPDP', area: 'Comercial', datosSensibles: false,
      retencion: '5 años desde la última cita',
      categorias: ['Identificación', 'Contacto'],
    },
    {
      key: 'DEMO-TRAT-05', codigoRat: 'DEMO-a5',
      nombre: 'Atención pediátrica y adolescente',
      finalidad: 'Brindar atención médica especializada a menores de edad',
      baseLegal: 'Art. 7 LOPDP', area: 'Dirección Médica', datosSensibles: true,
      retencion: '10 años desde mayoría de edad del titular',
      categorias: ['Identificación', 'Contacto', 'Salud', 'Menores'],
    },
    {
      key: 'DEMO-TRAT-06', codigoRat: 'DEMO-a6',
      nombre: 'Campañas de salud preventiva y mercadotecnia',
      finalidad: 'Difundir campañas preventivas y promocionar servicios de salud',
      baseLegal: 'Art. 7 y Art. 8 LOPDP', area: 'Marketing', datosSensibles: false,
      retencion: 'Hasta revocación del consentimiento',
      categorias: ['Identificación', 'Contacto'],
    },
    {
      key: 'DEMO-TRAT-07', codigoRat: 'DEMO-a7',
      nombre: 'Triage asistido y score de riesgo clínico',
      finalidad: 'Priorizar la atención médica mediante modelo predictivo',
      baseLegal: 'Art. 7 LOPDP', area: 'Dirección Médica', datosSensibles: true,
      retencion: '10 años junto con historia clínica',
      categorias: ['Identificación', 'Salud', 'Perfiles y valoraciones'],
    },
    {
      key: 'DEMO-TRAT-08', codigoRat: 'DEMO-a8',
      nombre: 'Gestión de proveedores y contratistas',
      finalidad: 'Administrar relaciones comerciales con terceros',
      baseLegal: 'Art. 7 LOPDP', area: 'Financiero', datosSensibles: false,
      retencion: '7 años desde fin de relación contractual',
      categorias: ['Identificación', 'Contacto', 'Financieros'],
    },
    {
      // HALLAZGO INTENCIONAL: sin base legal
      key: 'DEMO-TRAT-09', codigoRat: 'DEMO-a9',
      nombre: 'Convenios con aseguradoras',
      finalidad: 'Compartir datos de pacientes con aseguradoras para facturación',
      baseLegal: null, area: 'Financiero', datosSensibles: true,
      retencion: 'No definido',
      categorias: ['Identificación', 'Salud', 'Financieros'],
    },
    {
      key: 'DEMO-TRAT-10', codigoRat: 'DEMO-a10',
      nombre: 'Grabación de llamadas del call center',
      finalidad: 'Registrar llamadas para calidad y resolución de controversias',
      baseLegal: 'Art. 7 y Art. 8 LOPDP', area: 'Atención al Cliente', datosSensibles: true,
      retencion: '12 meses',
      categorias: ['Identificación', 'Contacto', 'Imagen y voz', 'Salud'],
    },
  ];

  const tratamientos: Record<string, { id: string }> = {};

  for (const t of tratamientosData) {
    const id = demoUuid(t.key);
    const result = await prisma.tratamiento.upsert({
      where: { tenantId_codigoRat: { tenantId, codigoRat: t.codigoRat } },
      update: {
        clienteId: cliente.id,
        retencion: (t as any).retencion ?? null,
        categorias: (t as any).categorias ?? [],
      },
      create: {
        id,
        tenantId,
        clienteId: cliente.id,
        codigoRat: t.codigoRat,
        nombre: t.nombre,
        finalidad: t.finalidad,
        baseLegal: t.baseLegal,
        area: t.area,
        datosSensibles: t.datosSensibles,
        retencion: (t as any).retencion ?? null,
        categorias: (t as any).categorias ?? [],
        estado: 'PENDIENTE',
      },
    });
    tratamientos[t.key] = result;
  }
  console.log('  10 tratamientos');

  // ══════════════════════════════════════════════════════════
  // 3. ACTIVOS (8)
  // ══════════════════════════════════════════════════════════

  const activosData = [
    {
      key: 'DEMO-ACT-01',
      nombre: 'Sistema de Historia Clínica Electrónica (HCE)',
      tipo: 'Aplicación',
      criticidad: 'ALTA' as const,
      responsable: 'Dept. TI',
      ubicacion: 'Servidor local / Cloud privada',
      sistemas: ['HCE', 'HL7 FHIR'],
    },
    {
      key: 'DEMO-ACT-02',
      nombre: 'Sistema de Nómina y Talento Humano',
      tipo: 'Aplicación',
      criticidad: 'ALTA' as const,
      responsable: 'Dept. TI',
      ubicacion: 'Cloud SaaS',
      sistemas: ['ERP RRHH'],
    },
    {
      key: 'DEMO-ACT-03',
      nombre: 'CRM de pacientes DEMO CloudCare',
      tipo: 'Servicio SaaS',
      criticidad: 'ALTA' as const,
      responsable: 'Dept. TI',
      ubicacion: 'Cloud SaaS',
      sistemas: ['CloudCare CRM'],
    },
    {
      key: 'DEMO-ACT-04',
      nombre: 'Circuito cerrado de televisión',
      tipo: 'Infraestructura',
      criticidad: 'MEDIA' as const,
      responsable: 'Seguridad Física',
      ubicacion: 'Instalaciones clínica',
      sistemas: ['CCTV', 'NVR'],
    },
    {
      key: 'DEMO-ACT-05',
      nombre: 'Grabador de llamadas del Call Center',
      tipo: 'Aplicación',
      criticidad: 'MEDIA' as const,
      responsable: 'Dept. TI',
      ubicacion: 'Servidor local',
      sistemas: ['PBX', 'Grabador VoIP'],
    },
    {
      key: 'DEMO-ACT-06',
      nombre: 'Motor de triage asistido — Modelo predictivo',
      tipo: 'Aplicación',
      criticidad: 'ALTA' as const,
      responsable: 'Dept. TI',
      ubicacion: 'Cloud privada',
      sistemas: ['ML Model', 'API REST'],
    },
    {
      key: 'DEMO-ACT-07',
      nombre: 'Archivo físico de historias clínicas',
      tipo: 'Archivo físico',
      criticidad: 'ALTA' as const,
      responsable: 'Dirección Médica',
      ubicacion: 'Archivo central — Planta Baja',
      sistemas: [],
    },
    {
      key: 'DEMO-ACT-08',
      nombre: 'Control biométrico de acceso',
      tipo: 'Infraestructura',
      criticidad: 'ALTA' as const,
      responsable: 'Seguridad Física',
      ubicacion: 'Todas las sedes',
      sistemas: ['Lector biométrico', 'Software de control'],
    },
  ];

  const activos: Record<string, { id: string }> = {};

  for (const a of activosData) {
    const id = demoUuid(a.key);
    // Activo has no natural unique key per tenant, so we try findFirst + create
    let existing = await prisma.activo.findFirst({
      where: { id },
    });
    if (!existing) {
      existing = await prisma.activo.create({
        data: {
          id,
          tenantId,
          clienteId: cliente.id,
          nombre: a.nombre,
          tipo: a.tipo,
          criticidad: a.criticidad,
          responsable: a.responsable,
          ubicacion: a.ubicacion,
          sistemas: a.sistemas,
          contienePersonales: true,
        },
      });
    } else {
      await prisma.activo.update({ where: { id }, data: { clienteId: cliente.id } });
    }
    activos[a.key] = existing;
  }
  console.log('  8 activos');

  // ══════════════════════════════════════════════════════════
  // 4. TRATAMIENTO-ACTIVO relations (link relevant pairs)
  // ══════════════════════════════════════════════════════════

  const tratActLinks: [string, string][] = [
    ['DEMO-TRAT-01', 'DEMO-ACT-01'],
    ['DEMO-TRAT-01', 'DEMO-ACT-07'],
    ['DEMO-TRAT-02', 'DEMO-ACT-02'],
    ['DEMO-TRAT-03', 'DEMO-ACT-04'],
    ['DEMO-TRAT-04', 'DEMO-ACT-03'],
    ['DEMO-TRAT-05', 'DEMO-ACT-01'],
    ['DEMO-TRAT-06', 'DEMO-ACT-03'],
    ['DEMO-TRAT-07', 'DEMO-ACT-06'],
    ['DEMO-TRAT-08', 'DEMO-ACT-02'],
    ['DEMO-TRAT-09', 'DEMO-ACT-01'],
    ['DEMO-TRAT-10', 'DEMO-ACT-05'],
    ['DEMO-TRAT-03', 'DEMO-ACT-08'],
  ];

  for (const [tKey, aKey] of tratActLinks) {
    const tratId = tratamientos[tKey].id;
    const actId = activos[aKey].id;
    await prisma.tratamientoActivo.upsert({
      where: {
        tratamientoId_activoId: { tratamientoId: tratId, activoId: actId },
      },
      update: {},
      create: {
        tratamientoId: tratId,
        activoId: actId,
      },
    });
  }
  console.log('  12 tratamiento-activo links');

  // ══════════════════════════════════════════════════════════
  // 5. RIESGOS (10)
  // ══════════════════════════════════════════════════════════

  const riesgosData = [
    {
      key: 'DEMO-RSG-01',
      trat: 'DEMO-TRAT-09',
      act: 'DEMO-ACT-01',
      impacto: 5,
      probabilidad: 5,
      score: 25,
      nivel: 'CRITICO' as const,
      estado: 'IDENTIFICADO' as const,
      requiereEipd: true,
      vulnerabilidadTexto: 'Cesión de datos de salud a aseguradoras sin base de legitimación documentada',
    },
    {
      key: 'DEMO-RSG-02',
      trat: 'DEMO-TRAT-01',
      act: 'DEMO-ACT-07',
      impacto: 5,
      probabilidad: 4,
      score: 20,
      nivel: 'CRITICO' as const,
      estado: 'IDENTIFICADO' as const,
      requiereEipd: true,
      vulnerabilidadTexto: 'Archivo físico de historias clínicas sin control de acceso adecuado',
    },
    {
      key: 'DEMO-RSG-03',
      trat: 'DEMO-TRAT-07',
      act: 'DEMO-ACT-06',
      impacto: 5,
      probabilidad: 4,
      score: 20,
      nivel: 'CRITICO' as const,
      estado: 'IDENTIFICADO' as const,
      requiereEipd: true,
      vulnerabilidadTexto: 'Modelo predictivo de triage sin explicabilidad ni canal de impugnación',
    },
    {
      key: 'DEMO-RSG-04',
      trat: 'DEMO-TRAT-01',
      act: 'DEMO-ACT-01',
      impacto: 4,
      probabilidad: 4,
      score: 16,
      nivel: 'ALTO' as const,
      estado: 'EN_TRATAMIENTO' as const,
      requiereEipd: true,
      vulnerabilidadTexto: 'HCE con acceso excesivo — personal no médico puede ver historias completas',
    },
    {
      key: 'DEMO-RSG-05',
      trat: 'DEMO-TRAT-03',
      act: 'DEMO-ACT-04',
      impacto: 3,
      probabilidad: 4,
      score: 12,
      nivel: 'ALTO' as const,
      estado: 'IDENTIFICADO' as const,
      requiereEipd: false,
      vulnerabilidadTexto: 'Grabaciones de CCTV accesibles sin protocolo de custodia ni retención definida',
    },
    {
      key: 'DEMO-RSG-06',
      trat: 'DEMO-TRAT-04',
      act: 'DEMO-ACT-03',
      impacto: 4,
      probabilidad: 3,
      score: 12,
      nivel: 'ALTO' as const,
      estado: 'EN_TRATAMIENTO' as const,
      requiereEipd: false,
      vulnerabilidadTexto: 'CRM SaaS sin contrato de encargo — datos de pacientes en servidor de tercero',
    },
    {
      key: 'DEMO-RSG-07',
      trat: 'DEMO-TRAT-02',
      act: 'DEMO-ACT-02',
      impacto: 3,
      probabilidad: 3,
      score: 9,
      nivel: 'MEDIO' as const,
      estado: 'MITIGADO' as const,
      requiereEipd: false,
      vulnerabilidadTexto: 'Datos de nómina con acceso compartido entre áreas sin segregación',
    },
    {
      key: 'DEMO-RSG-08',
      trat: 'DEMO-TRAT-06',
      act: 'DEMO-ACT-03',
      impacto: 2,
      probabilidad: 4,
      score: 8,
      nivel: 'MEDIO' as const,
      estado: 'IDENTIFICADO' as const,
      requiereEipd: false,
      vulnerabilidadTexto: 'Campañas de marketing con listas de pacientes sin consentimiento específico',
    },
    {
      key: 'DEMO-RSG-09',
      trat: 'DEMO-TRAT-10',
      act: 'DEMO-ACT-05',
      impacto: 4,
      probabilidad: 3,
      score: 12,
      nivel: 'ALTO' as const,
      estado: 'IDENTIFICADO' as const,
      requiereEipd: false,
      vulnerabilidadTexto: 'Grabaciones de llamadas sin aviso previo al interlocutor ni retención limitada',
    },
    {
      key: 'DEMO-RSG-10',
      trat: 'DEMO-TRAT-05',
      act: 'DEMO-ACT-01',
      impacto: 3,
      probabilidad: 3,
      score: 9,
      nivel: 'MEDIO' as const,
      estado: 'IDENTIFICADO' as const,
      requiereEipd: false,
      vulnerabilidadTexto: 'Datos de menores sin consentimiento del representante legal verificado',
    },
  ];

  for (const r of riesgosData) {
    const id = demoUuid(r.key);
    const existing = await prisma.riesgo.findFirst({ where: { id } });
    if (!existing) {
      await prisma.riesgo.create({
        data: {
          id,
          tenantId,
          tratamientoId: tratamientos[r.trat].id,
          activoId: activos[r.act].id,
          impacto: r.impacto,
          probabilidad: r.probabilidad,
          score: r.score,
          nivel: r.nivel,
          estado: r.estado,
          requiereEipd: r.requiereEipd,
          vulnerabilidadTexto: r.vulnerabilidadTexto,
        },
      });
    }
  }
  console.log('  10 riesgos');

  // ══════════════════════════════════════════════════════════
  // 6. INCIDENTES (3)
  // ══════════════════════════════════════════════════════════

  const incidentesData = [
    {
      key: 'INC-DEMO-001',
      codigo: 'INC-DEMO-001',
      tipo: 'CONFIDENCIALIDAD' as const,
      trat: 'DEMO-TRAT-01',
      act: 'DEMO-ACT-01',
      descripcion:
        'Acceso no autorizado a sistema HCE por exempleado con credenciales activas. Se expusieron 342 historias clínicas durante 48 horas.',
      fechaDeteccion: new Date('2026-06-04T08:30:00Z'),
      notificadoSpdp: true,
      fechaNotificacion: new Date('2026-06-06T14:00:00Z'),
      titularesComunicados: true,
      estado: 'CERRADO' as const,
    },
    {
      key: 'INC-DEMO-002',
      codigo: 'INC-DEMO-002',
      tipo: 'CONFIDENCIALIDAD' as const,
      trat: 'DEMO-TRAT-04',
      act: 'DEMO-ACT-03',
      descripcion:
        'Exportación masiva de datos de pacientes desde CRM CloudCare por usuario con permisos excesivos. Datos enviados a correo personal. Fuera de plazo de 72h para notificación a SPDP.',
      fechaDeteccion: new Date('2026-08-02T10:00:00Z'),
      notificadoSpdp: false,
      fechaNotificacion: null,
      titularesComunicados: false,
      estado: 'DETECTADO' as const,
    },
    {
      key: 'INC-DEMO-003',
      codigo: 'INC-DEMO-003',
      tipo: 'INTEGRIDAD' as const,
      trat: 'DEMO-TRAT-01',
      act: 'DEMO-ACT-07',
      descripcion:
        'Deterioro de historias clínicas en archivo físico por filtración de agua. 87 expedientes con daño parcial. Fuera de plazo de 72h para notificación a SPDP.',
      fechaDeteccion: new Date('2026-08-27T06:00:00Z'),
      notificadoSpdp: false,
      fechaNotificacion: null,
      titularesComunicados: false,
      estado: 'DETECTADO' as const,
    },
  ];

  for (const inc of incidentesData) {
    const id = demoUuid(inc.key);
    const fechaDet = inc.fechaDeteccion;
    const fechaMaxReporte = new Date(
      fechaDet.getTime() + 72 * 60 * 60 * 1000,
    );

    const existing = await prisma.incidente.findFirst({ where: { id } });
    if (!existing) {
      await prisma.incidente.create({
        data: {
          id,
          tenantId,
          codigo: inc.codigo,
          tipo: inc.tipo,
          tratamientoId: tratamientos[inc.trat].id,
          activoId: activos[inc.act].id,
          descripcion: inc.descripcion,
          fechaDeteccion: fechaDet,
          fechaMaxReporte,
          notificadoSpdp: inc.notificadoSpdp,
          fechaNotificacion: inc.fechaNotificacion,
          titularesComunicados: inc.titularesComunicados,
          estado: inc.estado,
        },
      });
    }
  }
  console.log('  3 incidentes');

  // ══════════════════════════════════════════════════════════
  // 7. HALLAZGOS (5)
  // ══════════════════════════════════════════════════════════

  const hallazgosData = [
    {
      key: 'H-DEMO-001',
      codigo: 'H-DEMO-001',
      tipo: 'NC_MAYOR' as const,
      severidad: 'CRITICA' as const,
      descripcion:
        'Cesión de datos de salud a aseguradoras sin base de legitimación. El tratamiento DEMO-TRAT-09 (Convenios con aseguradoras) carece de base legal documentada, violando el principio de juridicidad (Art. 10 LOPDP).',
      faseOrigen: 2,
      estado: 'ABIERTO' as const,
      // Related to DEMO-TRAT-09
    },
    {
      key: 'H-DEMO-002',
      codigo: 'H-DEMO-002',
      tipo: 'NC_MAYOR' as const,
      severidad: 'CRITICA' as const,
      descripcion:
        'Modelo predictivo de triage (DEMO-TRAT-07) sin explicabilidad ni canal de impugnación para los titulares. Incumple Art. 29 LOPDP sobre decisiones automatizadas y el derecho a obtener intervención humana.',
      faseOrigen: 2,
      estado: 'ABIERTO' as const,
      // Related to DEMO-TRAT-07
    },
    {
      key: 'H-DEMO-003',
      codigo: 'H-DEMO-003',
      tipo: 'NC_MAYOR' as const,
      severidad: 'MAYOR' as const,
      descripcion:
        'Encargado externo (CRM CloudCare) opera sin contrato de encargo de tratamiento conforme Art. 38 LOPDP. Datos de pacientes procesados por tercero sin cláusulas DPA.',
      faseOrigen: 4,
      estado: 'EN_PROCESO' as const,
      // Related to DEMO-TRAT-01 / DEMO-TRAT-04
    },
    {
      key: 'H-DEMO-004',
      codigo: 'H-DEMO-004',
      tipo: 'NC_MENOR' as const,
      severidad: 'MENOR' as const,
      descripcion:
        'Brecha INC-DEMO-002 notificada fuera del término de 72 horas establecido en Art. 41 LOPDP. Se detectó el 02/08/2026 y al 14/09/2026 aún no se ha notificado a la SPDP.',
      faseOrigen: 6,
      estado: 'ABIERTO' as const,
      // Related to DEMO-TRAT-04
    },
    {
      key: 'H-DEMO-005',
      codigo: 'H-DEMO-005',
      tipo: 'OBSERVACION' as const,
      severidad: 'MENOR' as const,
      descripcion:
        'Canal de revocación de consentimiento para campañas de marketing (DEMO-TRAT-06) no es ágil ni gratuito. Los pacientes deben acudir presencialmente para revocar. Incumple Art. 8 LOPDP.',
      faseOrigen: 5,
      estado: 'ABIERTO' as const,
      // Related to DEMO-TRAT-06
    },
  ];

  for (const h of hallazgosData) {
    const id = demoUuid(h.key);
    const existing = await prisma.hallazgo.findFirst({ where: { id } });
    if (!existing) {
      await prisma.hallazgo.create({
        data: {
          id,
          tenantId,
          codigo: h.codigo,
          tipo: h.tipo,
          severidad: h.severidad,
          descripcion: h.descripcion,
          faseOrigen: h.faseOrigen,
          estado: h.estado,
        },
      });
    }
  }
  console.log('  5 hallazgos');

  // ══════════════════════════════════════════════════════════
  // Summary
  // ══════════════════════════════════════════════════════════

  console.log('\nDemo seed complete!');
  console.log('  Enterprise: DEMO CLINICA HORIZONTE S.A.');
  console.log('  10 tratamientos, 8 activos, 12 links');
  console.log('  10 riesgos (3 CRITICO, 4 ALTO, 3 MEDIO)');
  console.log('  3 incidentes (1 CERRADO, 2 DETECTADO fuera de plazo)');
  console.log('  5 hallazgos (2 NC_MAYOR CRITICA, 1 NC_MAYOR MAYOR, 1 NC_MENOR, 1 OBSERVACION)');
}

seedDemo()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
