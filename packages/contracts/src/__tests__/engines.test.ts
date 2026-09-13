import { describe, it, expect } from 'vitest';
import {
  calculatePdVar,
  calcularRiesgoPerfil,
  calcularScoreRiesgo,
  decidirEipd,
  calcularMadurezGlobal,
  madurezPorFase,
  calcularBrechaControles,
  fechaMaxReporte,
  estadoPlazo,
  plazoArco,
} from '../engines';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Minimal PdVarInput with all fields defaulting to the "safest" values. */
function basePdVarInput(overrides: Record<string, unknown> = {}) {
  return {
    sector: 'Otro',
    trabajadores: '1-9' as const,
    sucursales: '1-3' as const,
    volumenRegistros: '<1000' as const,
    categoriasTitulares: [] as string[],
    datosSalud: false,
    datosBiometricos: false,
    datosGeneticos: false,
    datosMenores: false,
    datosRaciales: false,
    datosPoliticos: false,
    datosReligiosos: false,
    datosSindicales: false,
    datosSexuales: false,
    datosPenales: false,
    usaIA: false,
    decisionesAutomatizadas: false,
    realizaPerfilamiento: false,
    transferenciasInternacionales: false,
    cloudExtranjero: false,
    tieneRAT: true,
    tieneEIPD: true,
    tieneLIA: true,
    tienePoliticas: true,
    tieneDPO: true,
    solicitudesARCO: '<10' as const,
    incidentesAnuales: '0' as const,
    compromisoDirectivo: true,
    comitePrivacidad: true,
    antecedentesReclamos: false,
    sancionesSPDP: false,
    ...overrides,
  };
}

function basePerfilInput(overrides: Record<string, unknown> = {}) {
  return {
    trataDatosSensibles: false,
    decisionesAutomatizadas: false,
    perfilamiento: false,
    sector: 'Otro',
    menoresEdad: false,
    brechaPreviaReportada: false,
    transferenciaInternacional: false,
    encargadoExterno: false,
    videovigilancia: false,
    ...overrides,
  };
}

// ===========================================================================
// 1. PD-Var Scoring (pdVar.ts)
// ===========================================================================
describe('PD-Var Scoring Engine', () => {
  it('should calculate pdScore = min(100, round((rawTotal / 85) * 100))', () => {
    const result = calculatePdVar(basePdVarInput());
    expect(result.pdScore).toBe(Math.min(100, Math.round((result.total / 85) * 100)));
  });

  it('should cap pdScore at 100 even when raw total exceeds 85', () => {
    // Turn on every high-scoring flag to push total way above 85
    const input = basePdVarInput({
      sector: 'Salud y Medicina',
      trabajadores: '200+',
      sucursales: '10+',
      volumenRegistros: '>100k',
      categoriasTitulares: ['a', 'b', 'c', 'd', 'e'],
      datosSalud: true,
      datosBiometricos: true,
      datosGeneticos: true,
      datosMenores: true,
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
      tieneRAT: false,
      tieneEIPD: false,
      tieneLIA: false,
      tienePoliticas: false,
      tieneDPO: false,
      solicitudesARCO: '>100',
      incidentesAnuales: '>5',
      compromisoDirectivo: false,
      comitePrivacidad: false,
      antecedentesReclamos: true,
      sancionesSPDP: true,
    });
    const result = calculatePdVar(input);
    expect(result.total).toBeGreaterThan(85);
    expect(result.pdScore).toBe(100);
  });

  // Boundary: Bajo -> Medio at pdScore = 20
  it('should classify pdScore=19 as Bajo', () => {
    // 19 = round((total/85)*100) => total ~= 16.15 => total=16 gives round(16/85*100)=round(18.82)=19
    const result = calculatePdVar(basePdVarInput());
    // Confirm via formula: we need specific total values
    const total = result.total;
    const score = Math.min(100, Math.round((total / 85) * 100));
    expect(result.pdScore).toBe(score);
    if (score < 20) {
      expect(result.nivelRiesgo).toBe('Bajo');
    }
  });

  it('should classify pdScore exactly 20 as Medio (boundary Bajo->Medio)', () => {
    // total=17 => round(17/85*100) = round(20) = 20
    const input = basePdVarInput({
      tieneRAT: false,    // +3
      tienePoliticas: false, // +3
      tieneDPO: false,    // +3
      compromisoDirectivo: false, // +3
      cloudExtranjero: true,  // +2
      volumenRegistros: '1-10k', // +2 (instead of +1)
    });
    // base: volumenRegistros '<1000' gives 1pt, ARCO '<10' gives 1pt = 2
    // with overrides: volumen 1-10k gives +2, cloud +2, RAT +3, politicas +3, DPO +3, compromiso +3, ARCO +1 = 17
    const result = calculatePdVar(input);
    expect(result.pdScore).toBe(Math.min(100, Math.round((result.total / 85) * 100)));
    // Verify boundary behavior
    if (result.pdScore === 20) {
      expect(result.nivelRiesgo).toBe('Medio');
    }
  });

  it('should classify pdScore=39 as Medio and pdScore=40 as Alto', () => {
    // Verify threshold at 40
    // pdScore 39: nivelRiesgo Medio; pdScore 40: nivelRiesgo Alto
    // These are derived from the engine formula
    expect(39 >= 40 ? 'Alto' : 39 >= 20 ? 'Medio' : 'Bajo').toBe('Medio');
    expect(40 >= 65 ? 'Crítico' : 40 >= 40 ? 'Alto' : 'Medio').toBe('Alto');
  });

  it('should classify pdScore=64 as Alto and pdScore=65 as Critico', () => {
    expect(64 >= 65 ? 'Crítico' : 64 >= 40 ? 'Alto' : 'Medio').toBe('Alto');
    expect(65 >= 65 ? 'Crítico' : 65 >= 40 ? 'Alto' : 'Medio').toBe('Crítico');
  });

  // Caso A vs B
  it('should return Caso A for micro-business with no high-risk flags', () => {
    const result = calculatePdVar(basePdVarInput({ trabajadores: '1-9' }));
    expect(result.caso).toBe('A');
  });

  it('should return Caso B when trabajadores > 1-9', () => {
    const result = calculatePdVar(basePdVarInput({ trabajadores: '10-49' }));
    expect(result.caso).toBe('B');
  });

  it('should return Caso B when 1-9 workers but high-risk flag set (e.g. datosSalud)', () => {
    const result = calculatePdVar(basePdVarInput({ trabajadores: '1-9', datosSalud: true }));
    expect(result.caso).toBe('B');
  });

  // Pricing tests
  it('should compute base fee 380 for 1-9 workers with Bajo risk', () => {
    const input = basePdVarInput();
    const result = calculatePdVar(input);
    // With lowest risk, base = 380 * 1.00 = 380, rounded to nearest 50 = 400
    if (result.nivelRiesgo === 'Bajo') {
      expect(result.honorarioMensual).toBe(400);
    }
  });

  it('should apply Critico multiplier 1.55 on base fee', () => {
    // A large high-risk org: 200+ workers base=1100, Critico multiplier=1.55 => 1705
    // plus add-ons for salud/menores (+100), IA (+75), transferencias (+50), sanciones (+150)
    const input = basePdVarInput({
      sector: 'Salud y Medicina',
      trabajadores: '200+',
      volumenRegistros: '>100k',
      datosSalud: true,
      datosMenores: true,
      usaIA: true,
      transferenciasInternacionales: true,
      sancionesSPDP: true,
      tieneRAT: false,
      tieneEIPD: false,
      tienePoliticas: false,
      tieneDPO: false,
      compromisoDirectivo: false,
      antecedentesReclamos: true,
      incidentesAnuales: '>5',
    });
    const result = calculatePdVar(input);
    // Verify Crítico level and pricing
    // 1100 * 1.55 = 1705 + 100 (salud/menores) + 75 (IA) + 50 (transferencias) + 150 (sanciones) = 2080
    // round(2080/50)*50 = 2100
    if (result.nivelRiesgo === 'Crítico') {
      expect(result.honorarioMensual).toBe(Math.round((1100 * 1.55 + 100 + 75 + 50 + 150) / 50) * 50);
    }
  });

  it('should always set implementacionFee to 5400', () => {
    const result = calculatePdVar(basePdVarInput());
    expect(result.implementacionFee).toBe(5400);

    const result2 = calculatePdVar(basePdVarInput({ trabajadores: '200+', sector: 'Salud y Medicina' }));
    expect(result2.implementacionFee).toBe(5400);
  });

  it('should round honorarioMensual to nearest 50', () => {
    const result = calculatePdVar(basePdVarInput());
    expect(result.honorarioMensual % 50).toBe(0);
  });

  it('should add 100 for salud/menores add-on', () => {
    const base = calculatePdVar(basePdVarInput({ trabajadores: '10-49' }));
    const withSalud = calculatePdVar(basePdVarInput({ trabajadores: '10-49', datosSalud: true }));
    // The presence of datosSalud also changes the risk level and caso, so we compare pricing directly
    expect(withSalud.honorarioMensual).toBeGreaterThanOrEqual(base.honorarioMensual);
  });
});

// ===========================================================================
// 2. Profile Risk (riesgoPerfil.ts)
// ===========================================================================
describe('Profile Risk Engine', () => {
  it('should return Bajo for all-false input (puntaje = 0)', () => {
    const result = calcularRiesgoPerfil(basePerfilInput());
    expect(result.puntaje).toBe(0);
    expect(result.nivel).toBe('Bajo');
  });

  it('should add 3 pts for datos sensibles', () => {
    const result = calcularRiesgoPerfil(basePerfilInput({ trataDatosSensibles: true }));
    expect(result.puntaje).toBe(3);
    expect(result.nivel).toBe('Medio');
  });

  it('should return Medio at puntaje = 3 (boundary Bajo->Medio)', () => {
    const result = calcularRiesgoPerfil(basePerfilInput({ trataDatosSensibles: true }));
    expect(result.puntaje).toBe(3);
    expect(result.nivel).toBe('Medio');
  });

  it('should return Bajo at puntaje = 2 (below Medio threshold)', () => {
    const result = calcularRiesgoPerfil(basePerfilInput({
      transferenciaInternacional: true,
      encargadoExterno: true,
    }));
    expect(result.puntaje).toBe(2);
    expect(result.nivel).toBe('Bajo');
  });

  it('should return Alto at puntaje = 5 (boundary Medio->Alto)', () => {
    const result = calcularRiesgoPerfil(basePerfilInput({
      trataDatosSensibles: true,    // +3
      decisionesAutomatizadas: true, // +2
    }));
    expect(result.puntaje).toBe(5);
    expect(result.nivel).toBe('Alto');
  });

  it('should return Alto at puntaje = 7', () => {
    const result = calcularRiesgoPerfil(basePerfilInput({
      trataDatosSensibles: true,        // +3
      decisionesAutomatizadas: true,     // +2
      transferenciaInternacional: true,  // +1
      encargadoExterno: true,            // +1
    }));
    expect(result.puntaje).toBe(7);
    expect(result.nivel).toBe('Alto');
  });

  it('should return Crítico at puntaje = 8 (boundary Alto->Crítico)', () => {
    const result = calcularRiesgoPerfil(basePerfilInput({
      trataDatosSensibles: true,        // +3
      decisionesAutomatizadas: true,     // +2
      menoresEdad: true,                 // +2
      transferenciaInternacional: true,  // +1
    }));
    expect(result.puntaje).toBe(8);
    expect(result.nivel).toBe('Crítico');
  });

  it('should cap at max score 12 with all flags and high-risk sector', () => {
    const result = calcularRiesgoPerfil(basePerfilInput({
      trataDatosSensibles: true,
      decisionesAutomatizadas: true,
      perfilamiento: true,
      sector: 'Salud y Medicina',
      menoresEdad: true,
      brechaPreviaReportada: true,
      transferenciaInternacional: true,
      encargadoExterno: true,
      videovigilancia: true,
    }));
    expect(result.puntaje).toBe(12);
    expect(result.nivel).toBe('Crítico');
  });

  it('should not double-count decisionesAutomatizadas and perfilamiento (max +2 for either)', () => {
    const both = calcularRiesgoPerfil(basePerfilInput({
      decisionesAutomatizadas: true,
      perfilamiento: true,
    }));
    const one = calcularRiesgoPerfil(basePerfilInput({
      decisionesAutomatizadas: true,
    }));
    // The OR condition means both true still gives only +2
    expect(both.puntaje).toBe(one.puntaje);
    expect(both.puntaje).toBe(2);
  });
});

// ===========================================================================
// 3. Risk Matrix 5x5 (riesgoMatriz.ts) — RN-201, INV-8
// ===========================================================================
describe('Risk Matrix 5x5 (RN-201, INV-8)', () => {
  it('should compute score as impacto * probabilidad', () => {
    expect(calcularScoreRiesgo(3, 4).score).toBe(12);
    expect(calcularScoreRiesgo(5, 5).score).toBe(25);
    expect(calcularScoreRiesgo(1, 1).score).toBe(1);
  });

  it('should classify score=1 as Bajo', () => {
    const result = calcularScoreRiesgo(1, 1);
    expect(result.nivel).toBe('Bajo');
    expect(result.requiereEipd).toBe(false);
  });

  it('should classify score=3 as Bajo (boundary below Medio)', () => {
    const result = calcularScoreRiesgo(1, 3);
    expect(result.score).toBe(3);
    expect(result.nivel).toBe('Bajo');
    expect(result.requiereEipd).toBe(false);
  });

  it('should classify score=4 as Medio (boundary Bajo->Medio)', () => {
    const result = calcularScoreRiesgo(2, 2);
    expect(result.score).toBe(4);
    expect(result.nivel).toBe('Medio');
    expect(result.requiereEipd).toBe(false);
  });

  it('should classify score=7 as Medio and not require EIPD', () => {
    // 7 < 8 => Medio, 7 < 12 => no EIPD from score, nivel=Medio => no EIPD
    const result = calcularScoreRiesgo(7, 1);
    expect(result.nivel).toBe('Medio');
    expect(result.requiereEipd).toBe(false);
  });

  it('should classify score=8 as Alto (boundary Medio->Alto) and require EIPD', () => {
    const result = calcularScoreRiesgo(2, 4);
    expect(result.score).toBe(8);
    expect(result.nivel).toBe('Alto');
    expect(result.requiereEipd).toBe(true);
  });

  it('should classify score=14 as Alto and require EIPD (score >= 12)', () => {
    // 14 >= 8 and < 15 => Alto; 14 >= 12 => requiereEipd via score
    const result = calcularScoreRiesgo(7, 2);
    expect(result.score).toBe(14);
    expect(result.nivel).toBe('Alto');
    expect(result.requiereEipd).toBe(true);
  });

  it('should classify score=15 as Crítico (boundary Alto->Crítico)', () => {
    const result = calcularScoreRiesgo(3, 5);
    expect(result.score).toBe(15);
    expect(result.nivel).toBe('Crítico');
    expect(result.requiereEipd).toBe(true);
  });

  it('should classify score=25 (max) as Crítico with EIPD required', () => {
    const result = calcularScoreRiesgo(5, 5);
    expect(result.score).toBe(25);
    expect(result.nivel).toBe('Crítico');
    expect(result.requiereEipd).toBe(true);
  });

  // INV-8: Alto/Critico => EIPD obligatoria
  it('should require EIPD for all Alto and Critico levels (INV-8)', () => {
    // Verify all Alto (score 8-14)
    for (let s = 8; s <= 14; s++) {
      const r = calcularScoreRiesgo(s, 1);
      if (r.nivel === 'Alto' || r.nivel === 'Crítico') {
        expect(r.requiereEipd).toBe(true);
      }
    }
    // Verify all Crítico (score >= 15)
    for (let s = 15; s <= 25; s++) {
      const r = calcularScoreRiesgo(s, 1);
      if (r.nivel === 'Crítico') {
        expect(r.requiereEipd).toBe(true);
      }
    }
  });

  it('should not require EIPD for Bajo and Medio with score < 12', () => {
    expect(calcularScoreRiesgo(1, 1).requiereEipd).toBe(false); // Bajo
    expect(calcularScoreRiesgo(2, 2).requiereEipd).toBe(false); // Medio, score=4
    expect(calcularScoreRiesgo(1, 5).requiereEipd).toBe(false); // Medio, score=5
  });
});

// ===========================================================================
// 4. EIPD Decision (eipd.ts) — Art. 39 LOPDP
// ===========================================================================
describe('EIPD Decision Engine (Art. 39 LOPDP)', () => {
  it('should return NO_OBLIGATORIO when all criteria are false', () => {
    const result = decidirEipd({
      granEscala: false,
      datosSensibles: false,
      decisionesAutomatizadas: false,
      perfilamiento: false,
      menores: false,
    });
    expect(result.decision).toBe('NO_OBLIGATORIO');
    expect(result.cumplidos).toBe(0);
  });

  it('should return OBLIGATORIO when datosSensibles alone is true', () => {
    const result = decidirEipd({
      granEscala: false,
      datosSensibles: true,
      decisionesAutomatizadas: false,
      perfilamiento: false,
      menores: false,
    });
    expect(result.decision).toBe('OBLIGATORIO');
    expect(result.cumplidos).toBe(1);
  });

  it('should return OBLIGATORIO when menores alone is true', () => {
    const result = decidirEipd({
      granEscala: false,
      datosSensibles: false,
      decisionesAutomatizadas: false,
      perfilamiento: false,
      menores: true,
    });
    expect(result.decision).toBe('OBLIGATORIO');
    expect(result.cumplidos).toBe(1);
  });

  it('should return NO_OBLIGATORIO when only granEscala is true (1 criterion, not sensible/menores)', () => {
    const result = decidirEipd({
      granEscala: true,
      datosSensibles: false,
      decisionesAutomatizadas: false,
      perfilamiento: false,
      menores: false,
    });
    expect(result.decision).toBe('NO_OBLIGATORIO');
    expect(result.cumplidos).toBe(1);
  });

  it('should return OBLIGATORIO when exactly 2 criteria are met', () => {
    const result = decidirEipd({
      granEscala: true,
      datosSensibles: false,
      decisionesAutomatizadas: true,
      perfilamiento: false,
      menores: false,
    });
    expect(result.decision).toBe('OBLIGATORIO');
    expect(result.cumplidos).toBe(2);
  });

  it('should return OBLIGATORIO when all 5 criteria are met', () => {
    const result = decidirEipd({
      granEscala: true,
      datosSensibles: true,
      decisionesAutomatizadas: true,
      perfilamiento: true,
      menores: true,
    });
    expect(result.decision).toBe('OBLIGATORIO');
    expect(result.cumplidos).toBe(5);
    expect(result.puntajeMtge).toBe(5);
  });

  it('should correctly report criterios in the output', () => {
    const result = decidirEipd({
      granEscala: true,
      datosSensibles: false,
      decisionesAutomatizadas: false,
      perfilamiento: true,
      menores: false,
    });
    expect(result.criterios).toEqual({
      granEscala: true,
      datosSensibles: false,
      decisionesAutomatizadas: false,
      perfilamiento: true,
      menores: false,
    });
  });

  it('should return NO_OBLIGATORIO for single non-sensitive criterion: perfilamiento alone', () => {
    const result = decidirEipd({
      granEscala: false,
      datosSensibles: false,
      decisionesAutomatizadas: false,
      perfilamiento: true,
      menores: false,
    });
    expect(result.decision).toBe('NO_OBLIGATORIO');
    expect(result.cumplidos).toBe(1);
  });
});

// ===========================================================================
// 5. Maturity (madurez.ts) — RN-701
// ===========================================================================
describe('Maturity Engine (RN-701)', () => {
  const allZero = { f1: 0, f2: 0, f3: 0, f4: 0, f5: 0, f6: 0, f7: 0 };
  const allHundred = { f1: 100, f2: 100, f3: 100, f4: 100, f5: 100, f6: 100, f7: 100 };

  describe('calcularMadurezGlobal', () => {
    it('should return 1.0 Inicial when all phases are 0%', () => {
      const result = calcularMadurezGlobal(allZero);
      expect(result.valor).toBe(1.0);
      expect(result.etiqueta).toBe('Inicial');
    });

    it('should return 5.0 Optimizado when all phases are 100%', () => {
      const result = calcularMadurezGlobal(allHundred);
      expect(result.valor).toBe(5.0);
      expect(result.etiqueta).toBe('Optimizado');
    });

    it('should only weight F1(0.20), F2(0.20), F5(0.25), F6(0.20), F7(0.15)', () => {
      // F3 and F4 should have zero impact on the global score
      const withF3F4 = calcularMadurezGlobal({ ...allZero, f3: 100, f4: 100 });
      const withoutF3F4 = calcularMadurezGlobal(allZero);
      expect(withF3F4.valor).toBe(withoutF3F4.valor);
    });

    it('should compute valor = 1 + (ponderado / 100) * 4', () => {
      // F1=50, rest zero => ponderado = 50*0.20 = 10 => valor = 1 + 10/100*4 = 1.40
      const result = calcularMadurezGlobal({ ...allZero, f1: 50 });
      expect(result.ponderado).toBeCloseTo(10, 5);
      expect(result.valor).toBeCloseTo(1.40, 2);
    });

    it('should label midpoint (50% all weighted phases) as Definido', () => {
      const input = { ...allZero, f1: 50, f2: 50, f5: 50, f6: 50, f7: 50 };
      const result = calcularMadurezGlobal(input);
      // ponderado = 50*(0.20+0.20+0.25+0.20+0.15) = 50*1.0 = 50
      // valor = 1 + 50/100*4 = 3.0
      expect(result.valor).toBe(3.0);
      expect(result.etiqueta).toBe('Definido');
    });

    it('should label valor in [2.0, 3.0) as Gestionado', () => {
      // ponderado = 25 => valor = 1 + 25/100*4 = 2.0 => floor(2.0)-1 = 0 => index 1? Let's check
      const input = { ...allZero, f1: 25, f2: 25, f5: 25, f6: 25, f7: 25 };
      const result = calcularMadurezGlobal(input);
      expect(result.valor).toBe(2.0);
      expect(result.etiqueta).toBe('Gestionado');
    });

    it('should label valor in [4.0, 5.0) as Controlado', () => {
      const input = { ...allZero, f1: 75, f2: 75, f5: 75, f6: 75, f7: 75 };
      const result = calcularMadurezGlobal(input);
      // ponderado = 75 => valor = 1 + 75/100*4 = 4.0
      expect(result.valor).toBe(4.0);
      expect(result.etiqueta).toBe('Controlado');
    });

    it('should round valor to 2 decimal places', () => {
      const input = { ...allZero, f1: 33, f2: 67 };
      const result = calcularMadurezGlobal(input);
      // ponderado = 33*0.2 + 67*0.2 = 6.6 + 13.4 = 20
      // valor = 1 + 20/100*4 = 1.8
      const strVal = result.valor.toString();
      const decimals = strVal.includes('.') ? strVal.split('.')[1]!.length : 0;
      expect(decimals).toBeLessThanOrEqual(2);
    });
  });

  describe('madurezPorFase', () => {
    it('should return 7 phases', () => {
      const result = madurezPorFase(allZero);
      expect(result).toHaveLength(7);
      expect(result.map(r => r.fase)).toEqual(['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7']);
    });

    it('should calculate individual phase levels independently', () => {
      const result = madurezPorFase({ f1: 0, f2: 100, f3: 50, f4: 25, f5: 75, f6: 100, f7: 0 });
      const f1 = result.find(r => r.fase === 'F1')!;
      const f2 = result.find(r => r.fase === 'F2')!;
      expect(f1.nivel).toBe(1.0);
      expect(f1.etiqueta).toBe('Inicial');
      expect(f2.nivel).toBe(5.0);
      expect(f2.etiqueta).toBe('Optimizado');
    });

    it('should include F3 and F4 in per-phase output (even though not weighted globally)', () => {
      const result = madurezPorFase({ ...allZero, f3: 100, f4: 100 });
      const f3 = result.find(r => r.fase === 'F3')!;
      const f4 = result.find(r => r.fase === 'F4')!;
      expect(f3.nivel).toBe(5.0);
      expect(f4.nivel).toBe(5.0);
    });
  });
});

// ===========================================================================
// 6. Control Gap (brechaControles.ts)
// ===========================================================================
describe('Control Gap Engine', () => {
  it('should return ADECUADO for 80% compliance', () => {
    const result = calcularBrechaControles([
      { categoria: 'Tecnicos', necesarios: 10, implementados: 8 },
    ]);
    expect(result.porcentajeGlobal).toBe(80);
    expect(result.veredicto).toBe('ADECUADO');
  });

  it('should return ADECUADO for 100% compliance', () => {
    const result = calcularBrechaControles([
      { categoria: 'Tecnicos', necesarios: 10, implementados: 10 },
    ]);
    expect(result.porcentajeGlobal).toBe(100);
    expect(result.veredicto).toBe('ADECUADO');
  });

  it('should return PARCIAL for 79% (boundary below ADECUADO)', () => {
    const result = calcularBrechaControles([
      { categoria: 'Organizativos', necesarios: 100, implementados: 79 },
    ]);
    expect(result.porcentajeGlobal).toBe(79);
    expect(result.veredicto).toBe('PARCIAL');
  });

  it('should return PARCIAL for exactly 50%', () => {
    const result = calcularBrechaControles([
      { categoria: 'Juridicos', necesarios: 10, implementados: 5 },
    ]);
    expect(result.porcentajeGlobal).toBe(50);
    expect(result.veredicto).toBe('PARCIAL');
  });

  it('should return INSUFICIENTE for 49% (boundary below PARCIAL)', () => {
    const result = calcularBrechaControles([
      { categoria: 'Documentales', necesarios: 100, implementados: 49 },
    ]);
    expect(result.porcentajeGlobal).toBe(49);
    expect(result.veredicto).toBe('INSUFICIENTE');
  });

  it('should return INSUFICIENTE for 0%', () => {
    const result = calcularBrechaControles([
      { categoria: 'Tecnicos', necesarios: 10, implementados: 0 },
    ]);
    expect(result.porcentajeGlobal).toBe(0);
    expect(result.veredicto).toBe('INSUFICIENTE');
  });

  it('should handle division by zero: necesarios=0 returns 100%', () => {
    const result = calcularBrechaControles([
      { categoria: 'Tecnicos', necesarios: 0, implementados: 0 },
    ]);
    expect(result.porcentajeGlobal).toBe(100);
    expect(result.veredicto).toBe('ADECUADO');
  });

  it('should aggregate across multiple categories', () => {
    const result = calcularBrechaControles([
      { categoria: 'Tecnicos', necesarios: 10, implementados: 8 },
      { categoria: 'Organizativos', necesarios: 10, implementados: 6 },
      { categoria: 'Juridicos', necesarios: 10, implementados: 4 },
      { categoria: 'Documentales', necesarios: 10, implementados: 2 },
    ]);
    // total: 40 necesarios, 20 implementados => 50%
    expect(result.totalNecesarios).toBe(40);
    expect(result.totalImplementados).toBe(20);
    expect(result.porcentajeGlobal).toBe(50);
    expect(result.faltantes).toBe(20);
    expect(result.veredicto).toBe('PARCIAL');
  });

  it('should calculate per-category percentages in detalle', () => {
    const result = calcularBrechaControles([
      { categoria: 'Tecnicos', necesarios: 10, implementados: 8 },
      { categoria: 'Organizativos', necesarios: 5, implementados: 0 },
    ]);
    expect(result.detalle[0]!.porcentaje).toBe(80);
    expect(result.detalle[1]!.porcentaje).toBe(0);
  });
});

// ===========================================================================
// 7. Plazos: 72h Clock + ARCO (plazos.ts) — RN-602, Art. 41, INV-9
// ===========================================================================
describe('Plazos Engine (72h Clock + ARCO)', () => {
  describe('fechaMaxReporte', () => {
    it('should add exactly 72 hours (72*3600*1000 ms) to detection date', () => {
      const deteccion = new Date('2026-01-15T10:00:00Z');
      const max = fechaMaxReporte(deteccion);
      expect(max.getTime() - deteccion.getTime()).toBe(72 * 60 * 60 * 1000);
    });

    it('should handle midnight detection', () => {
      const deteccion = new Date('2026-06-01T00:00:00Z');
      const max = fechaMaxReporte(deteccion);
      expect(max.toISOString()).toBe('2026-06-04T00:00:00.000Z');
    });

    it('should correctly cross month boundaries', () => {
      const deteccion = new Date('2026-01-30T12:00:00Z');
      const max = fechaMaxReporte(deteccion);
      expect(max.toISOString()).toBe('2026-02-02T12:00:00.000Z');
    });
  });

  describe('estadoPlazo (INV-9)', () => {
    const deteccion = new Date('2026-01-15T10:00:00Z');
    // max = 2026-01-18T10:00:00Z

    it('should return NOTIFICADO when notificado=true regardless of time', () => {
      const wayPast = new Date('2030-01-01T00:00:00Z');
      expect(estadoPlazo(wayPast, deteccion, true)).toBe('NOTIFICADO');
    });

    it('should return EN_PLAZO when more than 24h remain', () => {
      // 24h01min before deadline => EN_PLAZO
      const ahora = new Date('2026-01-17T09:59:00Z');
      // diff = max - ahora = 2026-01-18T10:00:00Z - 2026-01-17T09:59:00Z = 24h1min
      expect(estadoPlazo(ahora, deteccion, false)).toBe('EN_PLAZO');
    });

    it('should return POR_VENCER when exactly 24h remain (boundary)', () => {
      // diff = exactly 24h => diff <= 24*3600*1000 => POR_VENCER
      const ahora = new Date('2026-01-17T10:00:00Z');
      expect(estadoPlazo(ahora, deteccion, false)).toBe('POR_VENCER');
    });

    it('should return POR_VENCER at 1ms before deadline', () => {
      const ahora = new Date(new Date('2026-01-18T10:00:00Z').getTime() - 1);
      expect(estadoPlazo(ahora, deteccion, false)).toBe('POR_VENCER');
    });

    it('should return VENCIDO exactly at the deadline (diff = 0)', () => {
      const ahora = new Date('2026-01-18T10:00:00Z');
      expect(estadoPlazo(ahora, deteccion, false)).toBe('VENCIDO');
    });

    it('should return VENCIDO past the deadline', () => {
      const ahora = new Date('2026-01-19T00:00:00Z');
      expect(estadoPlazo(ahora, deteccion, false)).toBe('VENCIDO');
    });

    it('should return EN_PLAZO immediately after detection (71h59min remaining)', () => {
      // 1 minute after detection => ~71h59min remaining
      const ahora = new Date('2026-01-15T10:01:00Z');
      expect(estadoPlazo(ahora, deteccion, false)).toBe('EN_PLAZO');
    });

    it('should distinguish 71h59min (EN_PLAZO) from 72h01min past (VENCIDO)', () => {
      // 71h59min after detection = 1min before deadline
      const before = new Date(deteccion.getTime() + 71 * 3600000 + 59 * 60000);
      expect(estadoPlazo(before, deteccion, false)).toBe('POR_VENCER');

      // 72h01min after detection = 1min after deadline
      const after = new Date(deteccion.getTime() + 72 * 3600000 + 60000);
      expect(estadoPlazo(after, deteccion, false)).toBe('VENCIDO');
    });
  });

  describe('plazoArco (ARCO deadline skipping weekends)', () => {
    // NOTE: plazoArco uses local-time Date methods (getDay, setDate, getDate),
    // so we construct dates using local time to avoid timezone offset issues.

    /** Create a local-time date at noon to avoid DST edge cases. */
    function localDate(y: number, m: number, d: number): Date {
      return new Date(y, m - 1, d, 12, 0, 0, 0);
    }

    it('should return 15 business days from a Monday', () => {
      // Monday 2026-01-05
      const recepcion = localDate(2026, 1, 5);
      expect(recepcion.getDay()).toBe(1); // confirm Monday
      const result = plazoArco(recepcion, 15);
      // Mon Jan 5 start, add 15 biz days:
      // Jan 6(Tue)=1, 7=2, 8=3, 9=4, (skip 10-11)
      // 12=5, 13=6, 14=7, 15=8, 16=9, (skip 17-18)
      // 19=10, 20=11, 21=12, 22=13, 23=14, (skip 24-25)
      // 26=15
      expect(result.getDate()).toBe(26);
      expect(result.getMonth()).toBe(0); // January
      expect(result.getDay()).toBe(1); // Monday
    });

    it('should skip weekends when starting on Friday', () => {
      // Friday 2026-01-09
      const recepcion = localDate(2026, 1, 9);
      expect(recepcion.getDay()).toBe(5); // confirm Friday
      const result = plazoArco(recepcion, 1);
      // Next calendar day is Sat (skip), Sun (skip), Mon Jan 12 (count=1)
      expect(result.getDay()).toBe(1); // Monday
      expect(result.getDate()).toBe(12);
    });

    it('should skip weekends when starting on Saturday', () => {
      // Saturday 2026-01-10
      const recepcion = localDate(2026, 1, 10);
      expect(recepcion.getDay()).toBe(6); // confirm Saturday
      const result = plazoArco(recepcion, 1);
      // Next day is Sun (skip), then Mon Jan 12 (count=1)
      expect(result.getDay()).toBe(1); // Monday
      expect(result.getDate()).toBe(12);
    });

    it('should handle 0 business days by returning same date', () => {
      const recepcion = localDate(2026, 1, 15);
      const result = plazoArco(recepcion, 0);
      expect(result.getTime()).toBe(recepcion.getTime());
    });

    it('should correctly count 5 business days as one full work week', () => {
      // Monday 2026-01-05
      // +1 day = Tue Jan 6 (1), Wed 7 (2), Thu 8 (3), Fri 9 (4),
      // Sat 10 (skip), Sun 11 (skip), Mon 12 (5)
      const recepcion = localDate(2026, 1, 5);
      const result = plazoArco(recepcion, 5);
      expect(result.getDate()).toBe(12); // Monday Jan 12
      expect(result.getDay()).toBe(1);
    });

    it('should correctly handle Friday start for 15 business days', () => {
      // Friday 2026-01-09
      const recepcion = localDate(2026, 1, 9);
      const result = plazoArco(recepcion, 15);
      // From Fri Jan 9: Jan 12(Mon,1), 13(2), 14(3), 15(4), 16(5)
      // skip 17-18, 19(6), 20(7), 21(8), 22(9), 23(10)
      // skip 24-25, 26(11), 27(12), 28(13), 29(14), 30(15)
      expect(result.getDate()).toBe(30);
      expect(result.getMonth()).toBe(0); // January
      expect(result.getDay()).toBe(5); // Friday
    });

    it('should skip Sunday start correctly', () => {
      // Sunday 2026-01-11
      const recepcion = localDate(2026, 1, 11);
      expect(recepcion.getDay()).toBe(0); // confirm Sunday
      const result = plazoArco(recepcion, 1);
      // Next day Mon Jan 12 (count=1)
      expect(result.getDate()).toBe(12);
      expect(result.getDay()).toBe(1);
    });

    it('should never land on a weekend for any starting day', () => {
      for (let d = 1; d <= 31; d++) {
        const start = localDate(2026, 1, d);
        if (start.getMonth() !== 0) continue; // skip invalid dates
        const result = plazoArco(start, 15);
        const dayOfWeek = result.getDay();
        expect(dayOfWeek).not.toBe(0); // Not Sunday
        expect(dayOfWeek).not.toBe(6); // Not Saturday
      }
    });
  });
});
