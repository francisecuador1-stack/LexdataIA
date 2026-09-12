import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

function sha256(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

async function main() {
  console.log('Seeding LEXDATA IA database...');

  // ══════════════════════════════════════════════════════════
  // 1. TENANT + USUARIOS
  // ══════════════════════════════════════════════════════════

  const tenant = await prisma.tenant.create({
    data: { nombre: 'LEXDATA Demo', plan: 'enterprise', activo: true },
  });

  const dpo = await prisma.user.create({
    data: {
      tenantId: tenant.id, email: 'andreina.almeida@lexdata.ec',
      nombre: 'Dra. Andreina Almeida', rol: 'DPO_HUMANO',
      passwordHash: sha256('demo-password'),
    },
  });

  await prisma.user.create({
    data: {
      tenantId: tenant.id, email: 'analista@lexdata.ec',
      nombre: 'Carlos Mendoza', rol: 'DPO_ANALISTA',
      passwordHash: sha256('demo-password'),
    },
  });

  await prisma.user.create({
    data: {
      tenantId: tenant.id, email: 'mark@lexdata.ec',
      nombre: 'MARK AI', rol: 'MARK_AI',
      passwordHash: sha256('service-account'),
    },
  });

  // ══════════════════════════════════════════════════════════
  // 2. CLIENTES (5 empresas del prototipo)
  // ══════════════════════════════════════════════════════════

  await prisma.cliente.create({
    data: {
      tenantId: tenant.id, razonSocial: 'TecnoEcuador S.A.', ruc: '1791234567001',
      sector: 'Tecnología y Software', ciudad: 'Quito', provincia: 'Pichincha',
      empleados: '50-199', transferenciaInternacional: true,
      paisesDestino: ['Estados Unidos', 'Colombia'],
      encargadoExterno: true, nombreEncargado: 'AWS, Salesforce',
      decisionesAutomatizadas: true, perfilamiento: true, nivelRiesgo: 'ALTO',
    },
  });

  await prisma.cliente.create({
    data: {
      tenantId: tenant.id, razonSocial: 'Clínica MedSalud CIA. Ltda.', ruc: '0991234567001',
      sector: 'Salud y Medicina', ciudad: 'Guayaquil', provincia: 'Guayas',
      empleados: '10-49', trataDatosSensibles: true,
      tiposDatosSensibles: ['historias clínicas', 'datos biométricos', 'datos genéticos'],
      menoresEdad: true, nivelRiesgo: 'CRITICO',
    },
  });

  await prisma.cliente.create({
    data: {
      tenantId: tenant.id, razonSocial: 'Comercial Quito Distribuidora Ltda.', ruc: '1792345678001',
      sector: 'Comercio', ciudad: 'Quito', provincia: 'Pichincha',
      empleados: '10-49', nivelRiesgo: 'MEDIO',
    },
  });

  await prisma.cliente.create({
    data: {
      tenantId: tenant.id, razonSocial: 'Servicios GYE Consulting S.A.', ruc: '0993456789001',
      sector: 'Consultoría', ciudad: 'Guayaquil', provincia: 'Guayas',
      empleados: '1-9', nivelRiesgo: 'BAJO',
    },
  });

  await prisma.cliente.create({
    data: {
      tenantId: tenant.id, razonSocial: 'BancoPyme Ecuador S.A.', ruc: '1793456789001',
      sector: 'Finanzas/Banca/Seguros', ciudad: 'Quito', provincia: 'Pichincha',
      empleados: '200+', transferenciaInternacional: true,
      trataDatosSensibles: true, decisionesAutomatizadas: true, nivelRiesgo: 'CRITICO',
    },
  });

  // ══════════════════════════════════════════════════════════
  // 3. CORPUS NORMATIVO — 28 nacionales + 8 internacionales
  // ══════════════════════════════════════════════════════════

  const normasData: Array<{
    codigo: string; fuente: string; tipo: string; identificador: string;
    titulo: string; categoria: string; fasePHVA: string; resumen: string;
  }> = [
    { codigo: 'LOPDP-ART-7', fuente: 'LOPDP', tipo: 'NACIONAL', identificador: 'Art. 7', titulo: 'Consentimiento del titular', categoria: 'Bases de Legitimación', fasePHVA: 'PLANIFICAR', resumen: 'Regula las condiciones del consentimiento como base legal para el tratamiento de datos personales.' },
    { codigo: 'LOPDP-ART-9', fuente: 'LOPDP', tipo: 'NACIONAL', identificador: 'Art. 9', titulo: 'Obligación legal o reglamentaria', categoria: 'Bases de Legitimación', fasePHVA: 'PLANIFICAR', resumen: 'Establece la obligación legal como base de legitimación para el tratamiento.' },
    { codigo: 'LOPDP-ART-10', fuente: 'LOPDP', tipo: 'NACIONAL', identificador: 'Art. 10', titulo: 'Principios aplicables al tratamiento', categoria: 'Principios Rectores', fasePHVA: 'PLANIFICAR', resumen: 'Define los 13 principios que rigen todo tratamiento de datos personales.' },
    { codigo: 'LOPDP-ART-13', fuente: 'LOPDP', tipo: 'NACIONAL', identificador: 'Art. 13', titulo: 'Deber de información', categoria: 'Derechos del Titular', fasePHVA: 'HACER', resumen: 'Obligación del responsable de informar al titular sobre el tratamiento.' },
    { codigo: 'LOPDP-ART-17', fuente: 'LOPDP', tipo: 'NACIONAL', identificador: 'Art. 17', titulo: 'Protección reforzada — Menores de edad', categoria: 'Categorías Especiales', fasePHVA: 'PLANIFICAR', resumen: 'Establece protección reforzada para datos de NNA.' },
    { codigo: 'LOPDP-ART-29', fuente: 'LOPDP', tipo: 'NACIONAL', identificador: 'Art. 29', titulo: 'Derecho frente a decisiones automatizadas', categoria: 'Derechos del Titular', fasePHVA: 'HACER', resumen: 'Derecho a no ser objeto de decisiones basadas únicamente en tratamiento automatizado.' },
    { codigo: 'LOPDP-ART-37', fuente: 'LOPDP', tipo: 'NACIONAL', identificador: 'Art. 37', titulo: 'Registro de actividades de tratamiento', categoria: 'Obligaciones del Responsable', fasePHVA: 'HACER', resumen: 'Obligación de mantener un RAT actualizado.' },
    { codigo: 'LOPDP-ART-38', fuente: 'LOPDP', tipo: 'NACIONAL', identificador: 'Art. 38', titulo: 'Relación responsable-encargado', categoria: 'Encargados', fasePHVA: 'HACER', resumen: 'Regula la relación contractual entre responsable y encargado.' },
    { codigo: 'LOPDP-ART-39', fuente: 'LOPDP', tipo: 'NACIONAL', identificador: 'Art. 39', titulo: 'Evaluación de Impacto en Protección de Datos', categoria: 'EIPD', fasePHVA: 'PLANIFICAR', resumen: 'Obligación de realizar EIPD cuando el tratamiento implique alto riesgo.' },
    { codigo: 'LOPDP-ART-41', fuente: 'LOPDP', tipo: 'NACIONAL', identificador: 'Art. 41', titulo: 'Notificación de brechas de seguridad', categoria: 'Seguridad', fasePHVA: 'HACER', resumen: 'Notificar a la SPDP en máximo 72 horas desde la detección.' },
    { codigo: 'LOPDP-ART-42', fuente: 'LOPDP', tipo: 'NACIONAL', identificador: 'Art. 42', titulo: 'Funciones del DPO', categoria: 'DPO', fasePHVA: 'PLANIFICAR', resumen: 'Define funciones y responsabilidades del DPO.' },
    { codigo: 'LOPDP-ART-54', fuente: 'LOPDP', tipo: 'NACIONAL', identificador: 'Art. 54', titulo: 'Transferencias internacionales', categoria: 'Transferencias', fasePHVA: 'PLANIFICAR', resumen: 'Condiciones para transferencias internacionales de datos.' },
    { codigo: 'RGLOPDP-ART-6', fuente: 'RGLOPDP', tipo: 'NACIONAL', identificador: 'Art. 6', titulo: 'Desarrollo del principio de juridicidad', categoria: 'Principios', fasePHVA: 'PLANIFICAR', resumen: 'Desarrolla el principio de juridicidad.' },
    { codigo: 'RGLOPDP-ART-15', fuente: 'RGLOPDP', tipo: 'NACIONAL', identificador: 'Art. 15', titulo: 'Designación obligatoria del DPO', categoria: 'DPO', fasePHVA: 'PLANIFICAR', resumen: 'Criterios para la designación obligatoria del DPO.' },
    { codigo: 'SPDP-RES-2025-0028-R', fuente: 'SPDP', tipo: 'NACIONAL', identificador: 'Res. 2025-0028-R', titulo: 'Obligaciones del DPO ante la SPDP', categoria: 'DPO', fasePHVA: 'PLANIFICAR', resumen: 'Obligaciones de reporte del DPO ante la Superintendencia.' },
    { codigo: 'SPDP-RES-2024-0015-R', fuente: 'SPDP', tipo: 'NACIONAL', identificador: 'Res. 2024-0015-R', titulo: 'Metodología oficial de EIPD', categoria: 'EIPD', fasePHVA: 'PLANIFICAR', resumen: 'Metodología EIPD-EC oficial.' },
    { codigo: 'SGPDP-RES-0005-2026', fuente: 'SGPDP', tipo: 'NACIONAL', identificador: 'Res. 0005-2026-SGPDP', titulo: 'Categorización ampliada', categoria: 'Categorías Especiales', fasePHVA: 'PLANIFICAR', resumen: 'Datos de comportamiento digital y biométricos como protección reforzada.' },
    { codigo: 'CRE-ART-11', fuente: 'CRE', tipo: 'NACIONAL', identificador: 'Art. 11', titulo: 'Principio de igualdad', categoria: 'Derechos Fundamentales', fasePHVA: 'PLANIFICAR', resumen: 'Todas las personas son iguales y gozarán de los mismos derechos.' },
    { codigo: 'CRE-ART-16', fuente: 'CRE', tipo: 'NACIONAL', identificador: 'Art. 16', titulo: 'Derecho a la comunicación', categoria: 'Derechos Fundamentales', fasePHVA: 'PLANIFICAR', resumen: 'Derecho a la comunicación libre.' },
    { codigo: 'CRE-ART-18', fuente: 'CRE', tipo: 'NACIONAL', identificador: 'Art. 18', titulo: 'Derecho a la información', categoria: 'Derechos Fundamentales', fasePHVA: 'PLANIFICAR', resumen: 'Acceso a información de instituciones públicas.' },
    { codigo: 'CRE-ART-23', fuente: 'CRE', tipo: 'NACIONAL', identificador: 'Art. 23', titulo: 'Calidad de servicios', categoria: 'Derechos Fundamentales', fasePHVA: 'PLANIFICAR', resumen: 'Derecho a recibir servicios de calidad.' },
    { codigo: 'CRE-ART-44', fuente: 'CRE', tipo: 'NACIONAL', identificador: 'Art. 44', titulo: 'Protección de NNA', categoria: 'Derechos Fundamentales', fasePHVA: 'PLANIFICAR', resumen: 'El Estado protegerá a NNA.' },
    { codigo: 'CRE-ART-66-19', fuente: 'CRE', tipo: 'NACIONAL', identificador: 'Art. 66.19', titulo: 'Derecho a la protección de datos', categoria: 'Derechos Fundamentales', fasePHVA: 'PLANIFICAR', resumen: 'Protección de datos de carácter personal.' },
    { codigo: 'CRE-ART-66-20', fuente: 'CRE', tipo: 'NACIONAL', identificador: 'Art. 66.20', titulo: 'Derecho a la intimidad', categoria: 'Derechos Fundamentales', fasePHVA: 'PLANIFICAR', resumen: 'Intimidad personal y familiar.' },
    { codigo: 'CRE-ART-66-21', fuente: 'CRE', tipo: 'NACIONAL', identificador: 'Art. 66.21', titulo: 'Inviolabilidad de correspondencia', categoria: 'Derechos Fundamentales', fasePHVA: 'PLANIFICAR', resumen: 'Secreto de la correspondencia.' },
    { codigo: 'CRE-ART-75', fuente: 'CRE', tipo: 'NACIONAL', identificador: 'Art. 75', titulo: 'Tutela judicial efectiva', categoria: 'Derechos Fundamentales', fasePHVA: 'PLANIFICAR', resumen: 'Tutela judicial efectiva.' },
    { codigo: 'CRE-ART-92', fuente: 'CRE', tipo: 'NACIONAL', identificador: 'Art. 92', titulo: 'Hábeas Data', categoria: 'Garantías', fasePHVA: 'PLANIFICAR', resumen: 'Acceso y decisión sobre datos personales.' },
    { codigo: 'CRE-ART-229', fuente: 'CRE', tipo: 'NACIONAL', identificador: 'Art. 229', titulo: 'Servidores públicos', categoria: 'Función Pública', fasePHVA: 'PLANIFICAR', resumen: 'Regulación de servidores públicos.' },
    { codigo: 'ISO27001-6.1', fuente: 'ISO_27001', tipo: 'INTERNACIONAL', identificador: '§6.1', titulo: 'Acciones para abordar riesgos', categoria: 'Gestión de Riesgos', fasePHVA: 'PLANIFICAR', resumen: 'Planificación de acciones para riesgos del SGSI.' },
    { codigo: 'ISO27001-8.2', fuente: 'ISO_27001', tipo: 'INTERNACIONAL', identificador: '§8.2', titulo: 'Evaluación de riesgos de seguridad', categoria: 'Gestión de Riesgos', fasePHVA: 'HACER', resumen: 'Ejecución de la evaluación de riesgos.' },
    { codigo: 'ISO27701-5.2', fuente: 'ISO_27701', tipo: 'INTERNACIONAL', identificador: '§5.2', titulo: 'Política de privacidad', categoria: 'Gobernanza', fasePHVA: 'PLANIFICAR', resumen: 'Requisitos para la política de privacidad.' },
    { codigo: 'ISO27701-6.1', fuente: 'ISO_27701', tipo: 'INTERNACIONAL', identificador: '§6.1', titulo: 'Evaluación de riesgos de privacidad', categoria: 'Gestión de Riesgos', fasePHVA: 'PLANIFICAR', resumen: 'Análisis de riesgos de privacidad.' },
    { codigo: 'ISO42001-6.1', fuente: 'ISO_42001', tipo: 'INTERNACIONAL', identificador: '§6.1', titulo: 'Riesgos en sistemas de IA', categoria: 'IA', fasePHVA: 'PLANIFICAR', resumen: 'Gestión de riesgos en sistemas de IA.' },
    { codigo: 'ISO42001-8.4', fuente: 'ISO_42001', tipo: 'INTERNACIONAL', identificador: '§8.4', titulo: 'Operación de sistemas de IA', categoria: 'IA', fasePHVA: 'HACER', resumen: 'Requisitos operativos para sistemas de IA.' },
    { codigo: 'NIST-PR.DS-1', fuente: 'NIST', tipo: 'INTERNACIONAL', identificador: 'PR.DS-1', titulo: 'Data-at-Rest Protection', categoria: 'Seguridad', fasePHVA: 'HACER', resumen: 'Protección de datos en reposo.' },
    { codigo: 'NIST-PR.DS-2', fuente: 'NIST', tipo: 'INTERNACIONAL', identificador: 'PR.DS-2', titulo: 'Data-in-Transit Protection', categoria: 'Seguridad', fasePHVA: 'HACER', resumen: 'Protección de datos en tránsito.' },
  ];

  const normaIds: Record<string, string> = {};
  for (const n of normasData) {
    const texto = `Texto normativo de ${n.identificador} — ${n.titulo}. TODO: verificar con LEGAL_ADMIN`;
    const emisor = ['CRE', 'LOPDP', 'RGLOPDP'].includes(n.fuente) ? 'Asamblea Nacional' : ['SPDP', 'SGPDP'].includes(n.fuente) ? 'SPDP' : 'Organismo Internacional';
    const created = await prisma.norma.create({
      data: {
        codigo: n.codigo, fuente: n.fuente as any, tipo: n.tipo as any,
        identificador: n.identificador, titulo: n.titulo, categoria: n.categoria,
        resumenEjecutivo: n.resumen, textoNormativo: texto,
        organismoEmisor: emisor, fechaEmision: new Date('2021-05-26'),
        fasePHVA: n.fasePHVA as any, hashSha256: sha256(texto), modulosRelacionados: [],
      },
    });
    normaIds[n.codigo] = created.id;
  }
  console.log(`  ${normasData.length} normas`);

  // ══════════════════════════════════════════════════════════
  // 4. CONTROLES NORMATIVOS (18)
  // ══════════════════════════════════════════════════════════

  const ctrlData = [
    { n: 'LOPDP-ART-7', t: 'Formulario de consentimiento informado', e: 'Registro de consentimientos firmados o electrónicos', f: 'PLANIFICAR' },
    { n: 'LOPDP-ART-7', t: 'Mecanismo de revocación de consentimiento', e: 'Pantalla o formulario de revocación activo', f: 'PLANIFICAR' },
    { n: 'LOPDP-ART-9', t: 'Inventario de obligaciones legales aplicables', e: 'Documento con base legal y norma habilitante', f: 'PLANIFICAR' },
    { n: 'LOPDP-ART-10', t: 'Auditoría de principios por tratamiento (13 principios)', e: 'Acta de auditoría con checklist', f: 'VERIFICAR' },
    { n: 'LOPDP-ART-10', t: 'Política de protección de datos publicada', e: 'URL pública o acuse de recibo interno', f: 'PLANIFICAR' },
    { n: 'LOPDP-ART-13', t: 'Aviso de privacidad y política publicados', e: 'Aviso vigente en web o documento entregado', f: 'HACER' },
    { n: 'LOPDP-ART-39', t: 'Evaluación de impacto documentada', e: 'Informe EIPD con firma del DPO', f: 'PLANIFICAR' },
    { n: 'LOPDP-ART-39', t: 'Registro de tratamientos con EIPD obligatoria', e: 'Lista actualizada en RAT', f: 'PLANIFICAR' },
    { n: 'LOPDP-ART-41', t: 'Protocolo de notificación 72h a SPDP', e: 'Protocolo documentado y capacitación', f: 'HACER' },
    { n: 'LOPDP-ART-41', t: 'Plan de respuesta a incidentes', e: 'Plan aprobado y simulacro anual', f: 'HACER' },
    { n: 'LOPDP-ART-29', t: 'Mecanismo de revisión humana de decisiones automatizadas', e: 'Canal habilitado + tiempo de respuesta', f: 'HACER' },
    { n: 'LOPDP-ART-38', t: 'Contrato de encargado formalizado', e: 'Contrato firmado con cláusulas LOPDP', f: 'HACER' },
    { n: 'LOPDP-ART-54', t: 'Garantías de transferencia internacional', e: 'SCCs o nivel de adecuación', f: 'PLANIFICAR' },
    { n: 'LOPDP-ART-37', t: 'RAT actualizado', e: 'RAT vigente con fecha de última revisión', f: 'HACER' },
    { n: 'LOPDP-ART-42', t: 'DPO designado y notificado a la SPDP', e: 'Comunicación a la SPDP + nombramiento', f: 'PLANIFICAR' },
    { n: 'NIST-PR.DS-1', t: 'Cifrado de datos en reposo (AES-256)', e: 'Configuración verificada por auditoría técnica', f: 'HACER' },
    { n: 'ISO27701-5.2', t: 'Política de privacidad aprobada por dirección', e: 'Acta firmada por Gerente General', f: 'PLANIFICAR' },
    { n: 'ISO27701-6.1', t: 'Análisis de riesgos de privacidad anual', e: 'Informe con fecha y firma del DPO', f: 'PLANIFICAR' },
  ];

  for (const c of ctrlData) {
    await prisma.controlNormativo.create({
      data: {
        normaId: normaIds[c.n], titulo: c.t, descripcion: c.t,
        evidenciaRequerida: c.e, fasePHVA: c.f as any,
        hashSha256: sha256(`${c.t}|${c.e}`),
      },
    });
  }
  console.log(`  ${ctrlData.length} controles normativos`);

  // ══════════════════════════════════════════════════════════
  // 5. PRINCIPIOS RECTORES (13) + PREGUNTAS + ESTADO
  // ══════════════════════════════════════════════════════════

  const principios = [
    { nombre: 'Juridicidad', base: 'Art. 10 LOPDP', def: 'Todo tratamiento debe tener una base legal válida.', estado: 'VERIFICADO', preguntas: ['¿Cada actividad de tratamiento tiene asignada una base legal documentada?', '¿Se verifica la vigencia de la base legal de forma periódica?', '¿Se dispone de evidencia de la base legal para cada tratamiento?'] },
    { nombre: 'Transparencia', base: 'Art. 10, 13 LOPDP', def: 'El titular debe ser informado de manera clara.', estado: 'VERIFICADO', preguntas: ['¿Existe un aviso de privacidad publicado?', '¿El aviso contiene todos los elementos del Art. 13?', '¿Se informa al titular antes de recopilar sus datos?'] },
    { nombre: 'Finalidad', base: 'Art. 10 LOPDP', def: 'Los datos deben ser recopilados con fines determinados.', estado: 'PENDIENTE', preguntas: ['¿Cada tratamiento tiene una finalidad documentada?', '¿Se verifica que no exista tratamiento ulterior incompatible?', '¿La finalidad es explícita en el aviso de privacidad?'] },
    { nombre: 'Minimización', base: 'Art. 10 LOPDP', def: 'Solo datos adecuados, pertinentes y limitados.', estado: 'NO_VERIFICADO', preguntas: ['¿Se recopilan solo los datos necesarios?', '¿Se revisan periódicamente los formularios?', '¿Existen controles contra recopilación excesiva?'] },
    { nombre: 'Confidencialidad', base: 'Art. 10 LOPDP', def: 'Datos tratados de manera confidencial.', estado: 'VERIFICADO', preguntas: ['¿Existen acuerdos de confidencialidad?', '¿Se aplican controles de acceso por roles?', '¿Se cifran los datos?'] },
    { nombre: 'Seguridad', base: 'Art. 10, 30 LOPDP', def: 'Medidas técnicas y organizativas apropiadas.', estado: 'PENDIENTE', preguntas: ['¿Existe política de seguridad?', '¿Se evalúan vulnerabilidades?', '¿Existe plan de respuesta a incidentes?'] },
    { nombre: 'Proporcionalidad', base: 'Art. 10 LOPDP', def: 'Tratamiento proporcional a la finalidad.', estado: 'NO_VERIFICADO', preguntas: ['¿Se evalúa la proporcionalidad?', '¿Se documentan medidas de mitigación?', '¿Se aplica menor privilegio?'] },
    { nombre: 'Lealtad', base: 'Art. 10 LOPDP', def: 'Tratamiento leal y no engañoso.', estado: 'PENDIENTE', preguntas: ['¿El titular conoce todos los fines?', '¿Se evita el tratamiento encubierto?', '¿Se respetan expectativas razonables?'] },
    { nombre: 'Exactitud y Calidad', base: 'Art. 10 LOPDP / Art. 9 RGLOPDP', def: 'Datos exactos y actualizados.', estado: 'PENDIENTE', preguntas: ['¿Existen procedimientos de actualización?', '¿Se permite rectificación?', '¿Se verifican periódicamente?'] },
    { nombre: 'Limitación del Almacenamiento', base: 'Art. 10 LOPDP / Art. 11 RGLOPDP', def: 'Datos no conservados más del necesario.', estado: 'NO_VERIFICADO', preguntas: ['¿Existe política de retención?', '¿Se eliminan al cumplir plazo?', '¿Se revisan plazos?'] },
    { nombre: 'Responsabilidad Proactiva', base: 'Art. 10 LOPDP / Art. 12 RGLOPDP', def: 'Demostrar cumplimiento de principios.', estado: 'PENDIENTE', preguntas: ['¿Se documenta el cumplimiento?', '¿Existe SGPDP?', '¿Se realizan auditorías internas?'] },
    { nombre: 'No Discriminación', base: 'Art. 66 CRE / Art. 10 RGLOPDP', def: 'Tratamiento sin discriminación.', estado: 'NO_VERIFICADO', preguntas: ['¿Se evalúa riesgo de discriminación?', '¿Controles para decisiones automatizadas?', '¿Se audita equidad de algoritmos?'] },
    { nombre: 'Libre Circulación Controlada', base: 'Art. 54 LOPDP / Art. 13 RGLOPDP', def: 'Transferencias con garantías adecuadas.', estado: 'NO_VERIFICADO', preguntas: ['¿Se identifican transferencias internacionales?', '¿Se documentan garantías?', '¿Se informa al titular?'] },
  ];

  for (let i = 0; i < principios.length; i++) {
    const p = principios[i];
    const pr = await prisma.principioRector.create({
      data: { nombre: p.nombre, baseNormativa: p.base, definicion: p.def, orden: i + 1 },
    });
    for (let j = 0; j < p.preguntas.length; j++) {
      await prisma.principioPreguntaAuditoria.create({
        data: { principioId: pr.id, orden: j + 1, pregunta: p.preguntas[j] },
      });
    }
    await prisma.principioEstado.create({
      data: {
        tenantId: tenant.id, principioId: pr.id, estado: p.estado as any,
        verificadoAt: p.estado === 'VERIFICADO' ? new Date('2026-06-15') : null,
        verificadoPor: p.estado === 'VERIFICADO' ? dpo.id : null,
      },
    });
  }
  console.log('  13 principios rectores');

  // ══════════════════════════════════════════════════════════
  // 6. CATEGORÍAS DE DATOS (7)
  // ══════════════════════════════════════════════════════════

  const cats = [
    { nombre: 'Generales de Identificación', base: 'Art. 4 LOPDP', nivel: 'ESTANDAR', activa: true },
    { nombre: 'Contacto y Localización', base: 'Art. 25 RGLOPDP', nivel: 'ESTANDAR', activa: true },
    { nombre: 'Financieros y Crediticios', base: 'Art. 25 RGLOPDP', nivel: 'REFORZADO', activa: true },
    { nombre: 'Comportamiento Digital', base: 'Res. 0005-2026 SGPDP', nivel: 'REFORZADO', activa: true },
    { nombre: 'Sensibles', base: 'Art. 25 LOPDP', nivel: 'MAXIMO', activa: false },
    { nombre: 'Biométricos y Genéticos', base: 'Art. 25 LOPDP / Res. 0005-2026', nivel: 'MAXIMO', activa: false },
    { nombre: 'NNA', base: 'Art. 17 LOPDP', nivel: 'MAXIMO_REPRESENTANTE', activa: false },
  ];

  for (const c of cats) {
    const cat = await prisma.categoriaDatos.create({
      data: { nombre: c.nombre, baseNormativa: c.base, nivel: c.nivel as any },
    });
    await prisma.categoriaDatosTenant.create({
      data: { tenantId: tenant.id, categoriaId: cat.id, activa: c.activa },
    });
  }
  console.log('  7 categorías de datos');

  // ══════════════════════════════════════════════════════════
  // 7. AMENAZAS Y VULNERABILIDADES
  // ══════════════════════════════════════════════════════════

  const amenazas = [
    { familia: 'Cibercrimen', nombre: 'Acceso no autorizado externo', prob: 4, vulns: ['SQL Injection', 'Phishing dirigido', 'Ransomware', 'Brute force'] },
    { familia: 'Cibercrimen', nombre: 'Exfiltración de datos', prob: 3, vulns: ['Insider threat malicioso', 'API sin autenticación', 'Credenciales comprometidas'] },
    { familia: 'Error interno', nombre: 'Error humano en manejo de datos', prob: 4, vulns: ['Email al destinatario incorrecto', 'Publicación accidental', 'Eliminación incorrecta'] },
    { familia: 'Error interno', nombre: 'Configuración incorrecta de sistemas', prob: 3, vulns: ['Bucket S3 público', 'BD sin contraseña', 'Logs con datos sensibles'] },
    { familia: 'Legal/Regulatorio', nombre: 'Incumplimiento normativo', prob: 3, vulns: ['Tratamiento sin consentimiento', 'Falta de aviso de privacidad', 'Transferencia sin garantías'] },
    { familia: 'Proveedor', nombre: 'Brecha en proveedor o encargado', prob: 3, vulns: ['Hack a proveedor cloud', 'Incidente en SaaS tercero', 'Fuga en empresa de nómina'] },
  ];

  for (const a of amenazas) {
    const am = await prisma.amenaza.create({
      data: { familia: a.familia, nombre: a.nombre, descripcion: a.nombre, probabilidadBase: a.prob },
    });
    for (const v of a.vulns) {
      await prisma.vulnerabilidad.create({ data: { amenazaId: am.id, nombre: v } });
    }
  }
  console.log('  6 amenazas + vulnerabilidades');

  // ══════════════════════════════════════════════════════════
  // 8. DIAGNÓSTICO: 5 DIMENSIONES + 17 PREGUNTAS
  // ══════════════════════════════════════════════════════════

  const dims = [
    { nombre: 'Compromiso de la Alta Dirección', preguntas: [
      { e: '¿La alta dirección ha aprobado formalmente la Política de Protección de Datos?', b: 'Art. 10 LOPDP / ISO 27701 §5.2' },
      { e: '¿Existe un patrocinador ejecutivo designado para el SGPDP?', b: 'ISO 27701 §5.1' },
      { e: '¿La dirección asigna recursos suficientes al programa de privacidad?', b: 'Art. 30 LOPDP' },
      { e: '¿Se incluye el estado del SGPDP en revisiones de alta dirección al menos trimestralmente?', b: 'ISO 27701 §9.3' },
    ]},
    { nombre: 'Estructura Organizacional', preguntas: [
      { e: '¿Existe un organigrama que identifique las áreas que tratan datos personales?', b: 'Art. 37 LOPDP' },
      { e: '¿Se han definido responsabilidades de protección de datos por área?', b: 'Art. 42 LOPDP' },
      { e: '¿Existe un DPO designado formalmente?', b: 'Art. 42 LOPDP / Res. 2025-0028-R' },
      { e: '¿El DPO tiene independencia funcional y acceso directo a la dirección?', b: 'Art. 42 LOPDP' },
    ]},
    { nombre: 'Cultura de Protección de Datos', preguntas: [
      { e: '¿Se realizan capacitaciones periódicas en protección de datos?', b: 'Art. 30 LOPDP' },
      { e: '¿Existe un código de conducta que incluya protección de datos?', b: 'ISO 27701 §7.2' },
      { e: '¿Se evalúa el conocimiento del personal sobre protección de datos?', b: 'Art. 30 LOPDP' },
    ]},
    { nombre: 'Recursos Disponibles', preguntas: [
      { e: '¿Se cuenta con herramientas tecnológicas para la gestión de privacidad?', b: 'Art. 30 LOPDP' },
      { e: '¿Existe presupuesto asignado al programa de privacidad?', b: 'ISO 27701 §5.1' },
      { e: '¿El equipo de TI tiene formación en seguridad de datos personales?', b: 'Art. 30 LOPDP' },
    ]},
    { nombre: 'Gobierno del SGPDP', preguntas: [
      { e: '¿Existe un comité de protección de datos formalizado?', b: 'Art. 42 LOPDP' },
      { e: '¿Se realizan revisiones periódicas del SGPDP?', b: 'ISO 27701 §9.1' },
      { e: '¿Existen métricas e indicadores de cumplimiento?', b: 'ISO 27701 §9.1' },
    ]},
  ];

  for (let i = 0; i < dims.length; i++) {
    const dim = await prisma.diagnosticoDimension.create({ data: { nombre: dims[i].nombre, orden: i + 1 } });
    for (let j = 0; j < dims[i].preguntas.length; j++) {
      await prisma.diagnosticoPregunta.create({
        data: { dimensionId: dim.id, orden: j + 1, enunciado: dims[i].preguntas[j].e, baseNormativa: dims[i].preguntas[j].b },
      });
    }
  }
  console.log('  5 dimensiones + 17 preguntas');

  // ══════════════════════════════════════════════════════════
  // 9. CHECKLIST LOPDP (8 preguntas)
  // ══════════════════════════════════════════════════════════

  const checklist = [
    { p: '¿RAT actualizado con todos los campos del Art. 13?', b: 'Art. 13' },
    { p: '¿Todos los tratamientos con base de legitimación documentada?', b: 'Art. 7-12' },
    { p: '¿Contratos con encargados incluyen cláusulas DPA del Art. 38?', b: 'Art. 38' },
    { p: '¿Aviso de privacidad publicado con todos los elementos del Art. 13?', b: 'Art. 13' },
    { p: '¿Protocolo de brechas con notificación a SPDP <= 72h?', b: 'Art. 41' },
    { p: '¿Derechos ARCO con proceso documentado y plazos?', b: 'Art. 19-27' },
    { p: '¿Cifrado en tránsito y reposo para datos sensibles?', b: 'Art. 30 / ISO 27001' },
    { p: '¿El DPO tiene acceso independiente a la Dirección?', b: 'Art. 47' },
  ];

  for (let i = 0; i < checklist.length; i++) {
    await prisma.checklistItem.create({
      data: { perfil: 'LOPDP', orden: i + 1, pregunta: checklist[i].p, baseNormativa: checklist[i].b },
    });
  }
  console.log('  8 checklist items');

  // ══════════════════════════════════════════════════════════
  // 10. CURSOS (8) + 10 PREGUNTAS CADA UNO
  // ══════════════════════════════════════════════════════════

  const cursosData = [
    { codigo: 'CAP-001', titulo: 'Introducción a la LOPDP Ecuador', nivel: 'BASICO', cat: 'Marco Legal', base: 'LOPDP 2021', dur: 18 },
    { codigo: 'CAP-002', titulo: 'Derechos ARCO+ y atención al titular', nivel: 'BASICO', cat: 'Operativo', base: 'Arts. 19-22', dur: 22 },
    { codigo: 'CAP-003', titulo: 'Bases legales del tratamiento de datos', nivel: 'INTERMEDIO', cat: 'Marco Legal', base: 'Arts. 7-14', dur: 20 },
    { codigo: 'CAP-004', titulo: 'Protección de datos sensibles y menores', nivel: 'INTERMEDIO', cat: 'Datos Especiales', base: 'Arts. 25-26', dur: 25 },
    { codigo: 'CAP-005', titulo: 'Gestión de incidentes — Protocolo 72h', nivel: 'AVANZADO', cat: 'Seguridad', base: 'Art. 41', dur: 30 },
    { codigo: 'CAP-006', titulo: 'Evaluación de Impacto EIPD — Metodología', nivel: 'AVANZADO', cat: 'Técnico', base: 'Art. 39', dur: 35 },
    { codigo: 'CAP-007', titulo: 'Rol del DPO — Funciones y responsabilidades', nivel: 'INTERMEDIO', cat: 'Gobernanza', base: 'Arts. 49-52', dur: 28 },
    { codigo: 'CAP-008', titulo: 'Transferencias internacionales de datos', nivel: 'AVANZADO', cat: 'Internacional', base: 'Art. 54', dur: 24 },
  ];

  for (const c of cursosData) {
    const curso = await prisma.curso.create({
      data: { codigo: c.codigo, titulo: c.titulo, descripcion: `Módulo: ${c.titulo}`, nivel: c.nivel, categoria: c.cat, baseNormativa: c.base, duracionMin: c.dur },
    });
    for (let i = 1; i <= 10; i++) {
      await prisma.cursoPregunta.create({
        data: {
          cursoId: curso.id, orden: i, enunciado: `Pregunta ${i} — ${c.titulo}`,
          opciones: [{ text: 'Opción A' }, { text: 'Opción B' }, { text: 'Opción C' }, { text: 'Opción D' }],
          correcta: 0, explicacion: `Explicación de la respuesta correcta para pregunta ${i}.`,
        },
      });
    }
  }
  console.log('  8 cursos + 80 preguntas');

  // ══════════════════════════════════════════════════════════
  // 11. PIMS MÓDULOS (0-10) + 3 PREGUNTAS CADA UNO
  // ══════════════════════════════════════════════════════════

  const pimsData = [
    { n: 0, t: 'Fundamentos y Ecosistema', b: 'LOPDP Art. 1-5 · ISO/IEC 27701:2019', ps: [
      { e: '¿La empresa ha identificado formalmente que está sujeta a la LOPDP Ecuador?', nota: 'Toda entidad que trate datos personales de titulares en Ecuador debe cumplir la LOPDP.' },
      { e: '¿Se ha realizado algún diagnóstico previo de cumplimiento en protección de datos?', nota: 'Un gap analysis previo frente a LOPDP e ISO/IEC 27701 acelera la implementación.' },
      { e: '¿Existe una persona o equipo responsable de gestionar el cumplimiento normativo de privacidad?', nota: 'Puede ser el DPO, equipo legal o responsable interno designado.' },
    ]},
    { n: 1, t: 'Gobernanza y Compromiso Institucional', b: 'LOPDP Art. 42', ps: [{ e: '¿La alta dirección ha emitido compromiso formal con protección de datos?', nota: null }, { e: '¿Existe comité de privacidad formalizado?', nota: null }, { e: '¿Se ha designado formalmente un DPO ante la SPDP?', nota: null }] },
    { n: 2, t: 'Mapeo de Flujos e Inventario de Datos', b: 'LOPDP Art. 37', ps: [{ e: '¿Se han identificado todos los flujos de datos personales?', nota: null }, { e: '¿Existe un RAT documentado?', nota: null }, { e: '¿Se han clasificado los datos por categoría y sensibilidad?', nota: null }] },
    { n: 3, t: 'Adecuación de Políticas y Documentación', b: 'LOPDP Art. 10', ps: [{ e: '¿Existe política de protección de datos aprobada?', nota: null }, { e: '¿Se ha publicado aviso de privacidad conforme Art. 13?', nota: null }, { e: '¿Las políticas internas están alineadas con la LOPDP?', nota: null }] },
    { n: 4, t: 'Regularización Contractual con Terceros', b: 'LOPDP Art. 38', ps: [{ e: '¿Existen contratos DPA con todos los encargados?', nota: null }, { e: '¿Se han revisado contratos existentes para incluir cláusulas LOPDP?', nota: null }, { e: '¿Se evalúa periódicamente el cumplimiento de encargados?', nota: null }] },
    { n: 5, t: 'Operativización de Derechos ARCO-PS', b: 'LOPDP Art. 19-27', ps: [{ e: '¿Existe procedimiento documentado para solicitudes ARCO?', nota: null }, { e: '¿Se cumplen los plazos legales de respuesta?', nota: null }, { e: '¿Existe canal accesible para ejercicio de derechos?', nota: null }] },
    { n: 6, t: 'Seguridad Técnica y Gestión de Riesgos', b: 'LOPDP Art. 30', ps: [{ e: '¿Se aplica cifrado en reposo y tránsito?', nota: null }, { e: '¿Se realizan evaluaciones de vulnerabilidades?', nota: null }, { e: '¿Existe control de acceso basado en roles?', nota: null }] },
    { n: 7, t: 'Respuesta a Incidentes y Brechas', b: 'LOPDP Art. 41', ps: [{ e: '¿Existe protocolo de respuesta a incidentes?', nota: null }, { e: '¿Se cumple plazo 72h para notificar a SPDP?', nota: null }, { e: '¿Se han realizado simulacros?', nota: null }] },
    { n: 8, t: 'Cultura de Privacidad y KPIs', b: 'LOPDP Art. 30', ps: [{ e: '¿Se realizan capacitaciones periódicas?', nota: null }, { e: '¿Existen KPIs de cumplimiento?', nota: null }, { e: '¿Se mide eficacia de medidas de privacidad?', nota: null }] },
    { n: 9, t: 'Conservación, Bloqueo y Eliminación Segura', b: 'LOPDP Art. 10', ps: [{ e: '¿Existe política de retención y eliminación?', nota: null }, { e: '¿Se aplican procedimientos de eliminación segura?', nota: null }, { e: '¿Se bloquean datos cuando el titular solicita eliminación?', nota: null }] },
    { n: 10, t: 'Auditoría Interna y Control de Madurez', b: 'LOPDP Art. 42', ps: [{ e: '¿Se realizan auditorías internas del SGPDP?', nota: null }, { e: '¿Se evalúa el nivel de madurez?', nota: null }, { e: '¿Se implementan acciones correctivas?', nota: null }] },
  ];

  for (const m of pimsData) {
    const modulo = await prisma.pimsModulo.create({
      data: { numero: m.n, titulo: m.t, descripcion: m.t, baseNormativa: m.b },
    });
    for (let i = 0; i < m.ps.length; i++) {
      await prisma.pimsPregunta.create({
        data: { moduloId: modulo.id, orden: i + 1, enunciado: m.ps[i].e, nota: m.ps[i].nota },
      });
    }
  }
  console.log('  11 módulos PIMS + 33 preguntas');

  // ══════════════════════════════════════════════════════════
  // 12. DEMO DATA: tratamientos, activos, riesgos, controles, etc.
  // ══════════════════════════════════════════════════════════

  const t1 = await prisma.tratamiento.create({ data: { tenantId: tenant.id, codigoRat: 'a1', nombre: 'Gestión de clientes CRM', finalidad: 'Ejecución de contrato', baseLegal: 'Art. 8 LOPDP', area: 'Comercial', estado: 'PENDIENTE' } });
  const t2 = await prisma.tratamiento.create({ data: { tenantId: tenant.id, codigoRat: 'a2', nombre: 'Nómina de empleados', finalidad: 'Obligación legal', baseLegal: 'Art. 9 LOPDP', area: 'RRHH', estado: 'PENDIENTE' } });
  const t3 = await prisma.tratamiento.create({ data: { tenantId: tenant.id, codigoRat: 'a3', nombre: 'Plataforma SaaS usuarios', finalidad: 'Consentimiento', baseLegal: 'Art. 7 LOPDP', area: 'Tecnología', estado: 'PENDIENTE' } });

  const a1 = await prisma.activo.create({ data: { tenantId: tenant.id, nombre: 'CRM Salesforce', tipo: 'Servicio en nube', criticidad: 'ALTA', responsable: 'Carlos Mendoza Vega', ubicacion: 'EE.UU. AWS us-east-1', sistemas: ['Salesforce', 'API REST'] } });
  const a2 = await prisma.activo.create({ data: { tenantId: tenant.id, nombre: 'Base de datos de clientes PostgreSQL', tipo: 'Base de datos', criticidad: 'ALTA', responsable: 'Dept. Tecnología', ubicacion: 'AWS us-east-1', sistemas: ['PostgreSQL 14', 'AWS RDS'] } });
  const a3 = await prisma.activo.create({ data: { tenantId: tenant.id, nombre: 'Plataforma SaaS propia', tipo: 'Aplicación web', criticidad: 'ALTA', responsable: 'Dept. Desarrollo', ubicacion: 'AWS us-east-1', sistemas: ['React', 'Node.js', 'EC2'] } });
  const a4 = await prisma.activo.create({ data: { tenantId: tenant.id, nombre: 'Sistema de Nómina Bancolombia', tipo: 'Servicio en nube', criticidad: 'MEDIA', responsable: 'RRHH', ubicacion: 'Colombia', sistemas: ['Bancolombia SaaS'] } });

  // 5 riesgos
  await prisma.riesgo.create({ data: { tenantId: tenant.id, tratamientoId: t1.id, activoId: a4.id, impacto: 5, probabilidad: 3, score: 15, nivel: 'CRITICO', estado: 'IDENTIFICADO', requiereEipd: true, vulnerabilidadTexto: 'Decisiones automatizadas de perfilamiento sin revisión humana' } });
  await prisma.riesgo.create({ data: { tenantId: tenant.id, tratamientoId: t3.id, activoId: a3.id, impacto: 4, probabilidad: 3, score: 12, nivel: 'ALTO', estado: 'EN_TRATAMIENTO', requiereEipd: true, vulnerabilidadTexto: 'Acceso no autorizado — Autenticación sin MFA' } });
  await prisma.riesgo.create({ data: { tenantId: tenant.id, tratamientoId: t3.id, activoId: a2.id, impacto: 3, probabilidad: 4, score: 12, nivel: 'ALTO', estado: 'EN_TRATAMIENTO', requiereEipd: true, vulnerabilidadTexto: 'Transferencia internacional sin garantías — Datos a AWS sin SCCs' } });
  await prisma.riesgo.create({ data: { tenantId: tenant.id, tratamientoId: t1.id, activoId: a1.id, impacto: 4, probabilidad: 2, score: 8, nivel: 'ALTO', estado: 'IDENTIFICADO', vulnerabilidadTexto: 'Fuga de datos desde CRM — Permisos de exportación sin restricción' } });
  await prisma.riesgo.create({ data: { tenantId: tenant.id, tratamientoId: t2.id, activoId: a2.id, impacto: 3, probabilidad: 2, score: 6, nivel: 'MEDIO', estado: 'MITIGADO', vulnerabilidadTexto: 'Exposición de datos de nómina — Backups sin cifrado en S3' } });

  // 6 controles
  await prisma.control.create({ data: { tenantId: tenant.id, tipo: 'TECNICO', titulo: 'Cifrado de datos en reposo AES-256', baseNormativa: 'Art. 30 / NIST PR.DS-1', normaId: normaIds['NIST-PR.DS-1'], estado: 'IMPLEMENTADO', eficacia: 'ALTA' } });
  await prisma.control.create({ data: { tenantId: tenant.id, tipo: 'TECNICO', titulo: 'MFA — Autenticación multifactor', baseNormativa: 'Art. 30 LOPDP', estado: 'EN_PROGRESO' } });
  await prisma.control.create({ data: { tenantId: tenant.id, tipo: 'TECNICO', titulo: 'Registro de auditoría — logs inmutables', baseNormativa: 'Art. 37 LOPDP', normaId: normaIds['LOPDP-ART-37'], estado: 'IMPLEMENTADO', eficacia: 'MEDIA' } });
  await prisma.control.create({ data: { tenantId: tenant.id, tipo: 'LEGAL', titulo: 'Contrato de encargado con proveedores', baseNormativa: 'Art. 38 LOPDP', normaId: normaIds['LOPDP-ART-38'], estado: 'EN_PROGRESO' } });
  await prisma.control.create({ data: { tenantId: tenant.id, tipo: 'ORGANIZATIVO', titulo: 'Capacitación en protección de datos', baseNormativa: 'Art. 30 LOPDP', estado: 'IMPLEMENTADO', eficacia: 'MEDIA' } });
  await prisma.control.create({ data: { tenantId: tenant.id, tipo: 'ORGANIZATIVO', titulo: 'Protocolo de gestión de brechas', baseNormativa: 'Art. 41 LOPDP', normaId: normaIds['LOPDP-ART-41'], estado: 'PENDIENTE' } });

  // 3 hallazgos
  await prisma.hallazgo.create({ data: { tenantId: tenant.id, codigo: 'H-001', tipo: 'NC_MAYOR', severidad: 'CRITICA', descripcion: 'Contratos con encargados no incluyen cláusulas DPA del Art. 38', normaId: normaIds['LOPDP-ART-38'], faseOrigen: 6, estado: 'EN_PROCESO' } });
  await prisma.hallazgo.create({ data: { tenantId: tenant.id, codigo: 'H-002', tipo: 'NC_MENOR', severidad: 'MAYOR', descripcion: 'Protocolo de brechas sin notificación a SPDP ≤ 72h', normaId: normaIds['LOPDP-ART-41'], faseOrigen: 6, estado: 'ABIERTO' } });
  await prisma.hallazgo.create({ data: { tenantId: tenant.id, codigo: 'H-003', tipo: 'OBSERVACION', severidad: 'MENOR', descripcion: 'Aviso de privacidad SaaS no actualizado con decisiones automatizadas', normaId: normaIds['LOPDP-ART-13'], faseOrigen: 5, estado: 'PENDIENTE_EVIDENCIA' } });

  // 1 incidente
  const det = new Date('2026-06-03T10:00:00Z');
  await prisma.incidente.create({
    data: {
      tenantId: tenant.id, codigo: 'INC-2026-001', tipo: 'CONFIDENCIALIDAD',
      tratamientoId: t3.id, activoId: a3.id,
      descripcion: 'Acceso no autorizado a datos de usuarios de la plataforma SaaS.',
      fechaDeteccion: det, fechaMaxReporte: new Date(det.getTime() + 72 * 60 * 60 * 1000),
      notificadoSpdp: true, fechaNotificacion: new Date('2026-06-05T14:00:00Z'),
      estado: 'NOTIFICADO_SPDP',
    },
  });

  // 3 recomendaciones
  await prisma.recomendacion.create({ data: { tenantId: tenant.id, codigo: 'REC-2026-001', titulo: 'Formalizar contratos DPA con todos los encargados', descripcion: 'Revisar contratos con AWS, Salesforce y Bancolombia.', responsable: 'Legal + DPO', plazo: new Date('2026-08-30'), estado: 'EN_IMPLEMENTACION', prioridad: 'CRITICA', dominio: 'Marco Jurídico' } });
  await prisma.recomendacion.create({ data: { tenantId: tenant.id, codigo: 'REC-2026-002', titulo: 'Implementar protocolo de notificación 72h', descripcion: 'Documentar protocolo completo conforme Art. 41.', responsable: 'TI + Legal + DPO', plazo: new Date('2026-09-15'), estado: 'EMITIDA', prioridad: 'ALTA', dominio: 'Procesos' } });
  await prisma.recomendacion.create({ data: { tenantId: tenant.id, codigo: 'REC-2026-003', titulo: 'Actualizar aviso de privacidad SaaS', descripcion: 'Incluir información sobre decisiones automatizadas Art. 29.', responsable: 'Legal + Desarrollo', plazo: new Date('2026-08-15'), estado: 'EMITIDA', prioridad: 'ALTA', dominio: 'Marco Jurídico' } });

  // 3 auditorías
  await prisma.auditoria.create({ data: { tenantId: tenant.id, codigo: 'AUD-2026-01', tipo: 'INTERNA', objetivo: 'Auditoría de cumplimiento LOPDP — ciclo PHVA completo', responsable: 'Dra. Andreina Almeida', fecha: new Date('2026-03-15'), estado: 'CERRADA', cumplimientoPct: 62 } });
  await prisma.auditoria.create({ data: { tenantId: tenant.id, codigo: 'AUD-2026-02', tipo: 'INTERNA', objetivo: 'Revisión de controles técnicos y organizativos', responsable: 'Dra. Andreina Almeida', fecha: new Date('2026-07-01'), estado: 'EN_EJECUCION' } });
  await prisma.auditoria.create({ data: { tenantId: tenant.id, codigo: 'AUD-2026-EXT', tipo: 'EXTERNA', objetivo: 'Auditoría externa de certificación ISO 27701', responsable: 'Bureau Veritas', fecha: new Date('2026-10-01'), estado: 'PROGRAMADA' } });

  // 12 evaluaciones de capacitación
  const nombres = ['María García', 'Carlos López', 'Ana Martínez', 'Pedro Sánchez', 'Laura Torres', 'Diego Ruiz', 'Sofía Herrera', 'Andrés Vargas', 'Valentina Cruz', 'Javier Morales', 'Camila Reyes', 'Luis Jiménez'];
  const puntajes = [85, 92, 78, 65, 88, 72, 95, 60, 82, 76, 90, 70];
  const cursos = await prisma.curso.findMany({ take: 4 });
  for (let i = 0; i < 12; i++) {
    await prisma.evaluacion.create({
      data: {
        tenantId: tenant.id, cursoId: cursos[i % cursos.length].id,
        personaNombre: nombres[i], puntaje: puntajes[i],
        aprobado: puntajes[i] >= 70,
        fecha: new Date(`2026-${String(3 + Math.floor(i / 3)).padStart(2, '0')}-${String(10 + i).padStart(2, '0')}`),
      },
    });
  }

  console.log('  Demo: 3 tratamientos, 4 activos, 5 riesgos, 6 controles, 3 hallazgos, 1 incidente, 3 recomendaciones, 3 auditorías, 12 evaluaciones');
  console.log('\nSeed complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
