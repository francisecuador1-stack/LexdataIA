import { z } from 'zod';

export const PdVarInputSchema = z.object({
  sector: z.string(),
  trabajadores: z.enum(['1-9', '10-49', '50-199', '200+']).default('1-9'),
  sucursales: z.enum(['1-3', '4-10', '10+']).default('1-3'),
  volumenRegistros: z.enum(['<1000', '1-10k', '10-100k', '>100k']).default('<1000'),
  categoriasTitulares: z.array(z.string()).default([]),
  datosSalud: z.boolean().default(false),
  datosBiometricos: z.boolean().default(false),
  datosGeneticos: z.boolean().default(false),
  datosMenores: z.boolean().default(false),
  datosRaciales: z.boolean().default(false),
  datosPoliticos: z.boolean().default(false),
  datosReligiosos: z.boolean().default(false),
  datosSindicales: z.boolean().default(false),
  datosSexuales: z.boolean().default(false),
  datosPenales: z.boolean().default(false),
  usaIA: z.boolean().default(false),
  decisionesAutomatizadas: z.boolean().default(false),
  realizaPerfilamiento: z.boolean().default(false),
  transferenciasInternacionales: z.boolean().default(false),
  cloudExtranjero: z.boolean().default(false),
  tieneRAT: z.boolean().default(false),
  tieneEIPD: z.boolean().default(false),
  tieneLIA: z.boolean().default(false),
  tienePoliticas: z.boolean().default(false),
  tieneDPO: z.boolean().default(false),
  solicitudesARCO: z.enum(['<10', '10-50', '51-100', '>100']).default('<10'),
  incidentesAnuales: z.enum(['0', '1-2', '3-5', '>5']).default('0'),
  compromisoDirectivo: z.boolean().default(false),
  comitePrivacidad: z.boolean().default(false),
  antecedentesReclamos: z.boolean().default(false),
  sancionesSPDP: z.boolean().default(false),
});
export type PdVarInput = z.infer<typeof PdVarInputSchema>;

export interface PdVarFactor {
  label: string;
  pts: number;
}

export interface PdVarResult {
  factors: PdVarFactor[];
  total: number;
  pdScore: number;
  nivelRiesgo: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';
  caso: 'A' | 'B';
  honorarioMensual: number;
  implementacionFee: number;
}

const HIGH_RISK_SECTORS = ['Salud y Medicina', 'Finanzas/Banca/Seguros'];
const MID_RISK_SECTORS = ['Gobierno/Sector Público', 'Telecomunicaciones', 'Educación', 'Comercio Electrónico'];

export function calculatePdVar(input: PdVarInput): PdVarResult {
  const factors: PdVarFactor[] = [];

  // Sector
  if (HIGH_RISK_SECTORS.includes(input.sector)) {
    factors.push({ label: 'Sector de alto riesgo regulado (salud/finanzas)', pts: 4 });
  } else if (MID_RISK_SECTORS.includes(input.sector)) {
    factors.push({ label: 'Sector con regulación sectorial complementaria', pts: 2 });
  }

  // Trabajadores
  if (input.trabajadores === '200+') factors.push({ label: 'Gran empresa (200+ trabajadores)', pts: 3 });
  else if (input.trabajadores === '50-199') factors.push({ label: 'Mediana empresa (50–199)', pts: 2 });
  else if (input.trabajadores === '10-49') factors.push({ label: 'Pequeña empresa (10–49)', pts: 1 });

  // Sucursales
  if (input.sucursales === '10+') factors.push({ label: 'Red amplia de sucursales (10+)', pts: 2 });
  else if (input.sucursales === '4-10') factors.push({ label: 'Múltiples sucursales (4–10)', pts: 1 });

  // Volumen
  if (input.volumenRegistros === '>100k') factors.push({ label: 'Volumen masivo (>100 000 titulares)', pts: 6 });
  else if (input.volumenRegistros === '10-100k') factors.push({ label: 'Volumen alto (10 000–100 000)', pts: 4 });
  else if (input.volumenRegistros === '1-10k') factors.push({ label: 'Volumen moderado (1 000–10 000)', pts: 2 });
  else factors.push({ label: 'Volumen reducido (<1 000)', pts: 1 });

  // Categorías de titulares
  const catCount = input.categoriasTitulares.length;
  if (catCount >= 5) factors.push({ label: `${catCount} categorías de titulares distintas`, pts: 3 });
  else if (catCount >= 3) factors.push({ label: `${catCount} categorías de titulares distintas`, pts: 2 });
  else if (catCount >= 1) factors.push({ label: '1 categoría de titulares', pts: 1 });

  // Datos especiales
  if (input.datosSalud) factors.push({ label: 'Datos de salud (Art. 26 LOPDP)', pts: 5 });
  if (input.datosMenores) factors.push({ label: 'Datos de menores de edad (Art. 25 LOPDP)', pts: 5 });
  if (input.datosBiometricos) factors.push({ label: 'Datos biométricos / identificador único', pts: 4 });
  if (input.datosGeneticos) factors.push({ label: 'Datos genéticos', pts: 4 });

  // Otras categorías especiales
  const otherSpecial = [
    input.datosRaciales, input.datosPoliticos, input.datosReligiosos,
    input.datosSindicales, input.datosSexuales, input.datosPenales,
  ].filter(Boolean).length;
  if (otherSpecial > 0) {
    factors.push({ label: `${otherSpecial} categoría(s) especial(es) adicional(es)`, pts: Math.min(otherSpecial * 2, 5) });
  }

  // Tecnología
  if (input.usaIA) factors.push({ label: 'Sistemas de Inteligencia Artificial', pts: 4 });
  if (input.decisionesAutomatizadas) factors.push({ label: 'Decisiones automatizadas sobre titulares', pts: 3 });
  if (input.realizaPerfilamiento) factors.push({ label: 'Elaboración de perfiles de personas', pts: 3 });
  if (input.transferenciasInternacionales) factors.push({ label: 'Transferencias internacionales de datos', pts: 4 });
  if (input.cloudExtranjero) factors.push({ label: 'Proveedores cloud / SaaS en el extranjero', pts: 2 });

  // Madurez (negated)
  if (!input.tieneRAT) factors.push({ label: 'Sin Registro de Actividades de Tratamiento (RAT)', pts: 3 });
  if (!input.tieneEIPD) factors.push({ label: 'Sin Evaluación de Impacto (EIPD) realizada', pts: 2 });
  if (!input.tieneLIA) factors.push({ label: 'Sin Evaluación de Interés Legítimo (LIA)', pts: 1 });
  if (!input.tienePoliticas) factors.push({ label: 'Sin políticas formales de privacidad', pts: 3 });
  if (!input.tieneDPO) factors.push({ label: 'Sin Delegado de Protección de Datos designado', pts: 3 });

  // ARCO
  if (input.solicitudesARCO === '>100') factors.push({ label: 'Carga ARCO+ muy alta (>100/año)', pts: 4 });
  else if (input.solicitudesARCO === '51-100') factors.push({ label: 'Carga ARCO+ alta (51–100/año)', pts: 3 });
  else if (input.solicitudesARCO === '10-50') factors.push({ label: 'Carga ARCO+ moderada (10–50/año)', pts: 2 });
  else factors.push({ label: 'Carga ARCO+ reducida (<10/año)', pts: 1 });

  // Incidentes
  if (input.incidentesAnuales === '>5') factors.push({ label: 'Historial de incidentes crítico (>5/año)', pts: 5 });
  else if (input.incidentesAnuales === '3-5') factors.push({ label: 'Historial de incidentes alto (3–5/año)', pts: 3 });
  else if (input.incidentesAnuales === '1-2') factors.push({ label: 'Incidentes de seguridad previos (1–2/año)', pts: 2 });

  // Gobernanza (negated)
  if (!input.compromisoDirectivo) factors.push({ label: 'Sin compromiso documentado de la alta dirección', pts: 3 });
  if (!input.comitePrivacidad) factors.push({ label: 'Sin comité interno de privacidad', pts: 1 });
  if (input.antecedentesReclamos) factors.push({ label: 'Antecedentes de reclamos de titulares', pts: 4 });
  if (input.sancionesSPDP) factors.push({ label: 'Sanciones o advertencias previas del SPDP', pts: 6 });

  // Calculate score
  const total = factors.reduce((acc, f) => acc + f.pts, 0);
  const pdScore = Math.min(100, Math.round((total / 85) * 100));
  const nivelRiesgo = pdScore >= 65 ? 'Crítico' as const
    : pdScore >= 40 ? 'Alto' as const
    : pdScore >= 20 ? 'Medio' as const
    : 'Bajo' as const;

  // Caso A/B
  const caso = determinarCaso(input);

  // Honorarios
  const { honorarioMensual, implementacionFee } = calcularCotizacion(input, nivelRiesgo);

  return {
    factors: factors.sort((a, b) => b.pts - a.pts),
    total,
    pdScore,
    nivelRiesgo,
    caso,
    honorarioMensual,
    implementacionFee,
  };
}

// RN-901
export function determinarCaso(input: PdVarInput): 'A' | 'B' {
  const hasHighRisk = input.datosSalud || input.datosBiometricos || input.datosMenores
    || input.usaIA || input.transferenciasInternacionales || input.decisionesAutomatizadas
    || input.realizaPerfilamiento || input.datosGeneticos || input.sancionesSPDP
    || input.antecedentesReclamos;
  return (!input.trabajadores || input.trabajadores === '1-9') && !hasHighRisk ? 'A' : 'B';
}

export function calcularCotizacion(input: PdVarInput, nivelRiesgo: string) {
  let base = input.trabajadores === '200+' ? 1100
    : input.trabajadores === '50-199' ? 750
    : input.trabajadores === '10-49' ? 550 : 380;
  base *= nivelRiesgo === 'Crítico' ? 1.55
    : nivelRiesgo === 'Alto' ? 1.30
    : nivelRiesgo === 'Medio' ? 1.15 : 1.00;
  if (input.datosSalud || input.datosMenores) base += 100;
  if (input.usaIA || input.decisionesAutomatizadas) base += 75;
  if (input.transferenciasInternacionales) base += 50;
  if (input.sancionesSPDP) base += 150;
  return {
    honorarioMensual: Math.round(base / 50) * 50,
    implementacionFee: 5400,
  };
}
