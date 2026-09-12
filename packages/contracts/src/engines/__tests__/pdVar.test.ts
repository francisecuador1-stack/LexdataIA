import { describe, it, expect } from 'vitest';
import { calculatePdVar, determinarCaso, calcularCotizacion, PdVarInputSchema } from '../pdVar.js';

const BASE_INPUT = PdVarInputSchema.parse({ sector: 'Otro' });

describe('calculatePdVar', () => {
  it('TecnoEcuador (tech, 50-199, transferencias, decisiones auto, perfilamiento, sin RAT/EIPD/LIA/políticas/DPO) -> Alto', () => {
    const input = PdVarInputSchema.parse({
      sector: 'Telecomunicaciones',
      trabajadores: '50-199',
      transferenciasInternacionales: true,
      cloudExtranjero: true,
      decisionesAutomatizadas: true,
      realizaPerfilamiento: true,
      tieneRAT: false,
      tieneEIPD: false,
      tieneLIA: false,
      tienePoliticas: false,
      tieneDPO: false,
      categoriasTitulares: ['clientes', 'empleados', 'usuarios digitales'],
      volumenRegistros: '10-100k',
    });
    const result = calculatePdVar(input);
    expect(result.nivelRiesgo).toBe('Alto');
  });

  it('BancoPyme (finanzas, 200+, transferencias, datos sensibles, decisiones auto, sin todo) -> Critico', () => {
    const input = PdVarInputSchema.parse({
      sector: 'Finanzas/Banca/Seguros',
      trabajadores: '200+',
      sucursales: '10+',
      transferenciasInternacionales: true,
      cloudExtranjero: true,
      datosSalud: true,
      datosBiometricos: true,
      decisionesAutomatizadas: true,
      realizaPerfilamiento: true,
      tieneRAT: false,
      tieneEIPD: false,
      tieneLIA: false,
      tienePoliticas: false,
      tieneDPO: false,
      categoriasTitulares: ['clientes', 'empleados', 'proveedores', 'usuarios digitales', 'postulantes'],
      volumenRegistros: '>100k',
      incidentesAnuales: '3-5',
      sancionesSPDP: true,
    });
    const result = calculatePdVar(input);
    expect(result.nivelRiesgo).toBe('Crítico');
  });

  it('micro-empresa sin riesgo -> Medio or Bajo', () => {
    const input = PdVarInputSchema.parse({
      sector: 'Otro',
      trabajadores: '1-9',
    });
    const result = calculatePdVar(input);
    expect(['Medio', 'Bajo']).toContain(result.nivelRiesgo);
  });

  it('pdScore is capped at 100', () => {
    const input = PdVarInputSchema.parse({
      sector: 'Finanzas/Banca/Seguros',
      trabajadores: '200+',
      sucursales: '10+',
      volumenRegistros: '>100k',
      categoriasTitulares: ['a', 'b', 'c', 'd', 'e'],
      datosSalud: true,
      datosMenores: true,
      datosBiometricos: true,
      datosGeneticos: true,
      datosRaciales: true,
      datosPoliticos: true,
      datosReligiosos: true,
      datosSindicales: true,
      datosSexuales: true,
      datosPenales: true,
      usaIA: true,
      decisionesAutomatizadas: true,
      realizaPerfilamiento: true,
      transferenciasInternacionales: true,
      cloudExtranjero: true,
      incidentesAnuales: '>5',
      solicitudesARCO: '>100',
      antecedentesReclamos: true,
      sancionesSPDP: true,
    });
    const result = calculatePdVar(input);
    expect(result.pdScore).toBeLessThanOrEqual(100);
    expect(result.nivelRiesgo).toBe('Crítico');
  });
});

describe('determinarCaso', () => {
  it('micro-empresa sin riesgo -> caso A', () => {
    const input = PdVarInputSchema.parse({
      sector: 'Otro',
      trabajadores: '1-9',
    });
    expect(determinarCaso(input)).toBe('A');
  });

  it('empresa con datos sensibles -> caso B', () => {
    const input = PdVarInputSchema.parse({
      sector: 'Otro',
      trabajadores: '1-9',
      datosSalud: true,
    });
    expect(determinarCaso(input)).toBe('B');
  });

  it('empresa mediana sin riesgo -> caso B', () => {
    const input = PdVarInputSchema.parse({
      sector: 'Otro',
      trabajadores: '50-199',
    });
    expect(determinarCaso(input)).toBe('B');
  });
});

describe('calcularCotizacion', () => {
  it('bracket 200+ Critico', () => {
    const input = PdVarInputSchema.parse({ sector: 'Otro', trabajadores: '200+' });
    const result = calcularCotizacion(input, 'Crítico');
    expect(result.honorarioMensual).toBeGreaterThan(1100);
    expect(result.implementacionFee).toBe(5400);
  });

  it('bracket 1-9 Bajo', () => {
    const input = PdVarInputSchema.parse({ sector: 'Otro', trabajadores: '1-9' });
    const result = calcularCotizacion(input, 'Bajo');
    expect(result.honorarioMensual).toBe(400);
  });

  it('bracket 50-199 Medio', () => {
    const input = PdVarInputSchema.parse({ sector: 'Otro', trabajadores: '50-199' });
    const result = calcularCotizacion(input, 'Medio');
    // 750 * 1.15 = 862.5 -> round to nearest 50 = 850
    expect(result.honorarioMensual).toBe(850);
  });

  it('bracket 10-49 Alto', () => {
    const input = PdVarInputSchema.parse({ sector: 'Otro', trabajadores: '10-49' });
    const result = calcularCotizacion(input, 'Alto');
    // 550 * 1.30 = 715 -> round to nearest 50 = 700
    expect(result.honorarioMensual).toBe(700);
  });

  it('adds surcharges for datos sensibles, IA, transferencias, sanciones', () => {
    const input = PdVarInputSchema.parse({
      sector: 'Otro',
      trabajadores: '1-9',
      datosSalud: true,
      usaIA: true,
      transferenciasInternacionales: true,
      sancionesSPDP: true,
    });
    const result = calcularCotizacion(input, 'Bajo');
    // 380 * 1.00 + 100 + 75 + 50 + 150 = 755 -> round to nearest 50 = 750
    expect(result.honorarioMensual).toBe(750);
  });
});
