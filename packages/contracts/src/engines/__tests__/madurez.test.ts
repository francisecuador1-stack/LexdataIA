import { describe, it, expect } from 'vitest';
import { calcularMadurezGlobal, madurezPorFase, MadurezInput } from '../madurez.js';

describe('calcularMadurezGlobal', () => {
  it('prototype values -> global ~2.7-2.8, etiqueta Definido', () => {
    const input: MadurezInput = { f1: 80, f2: 40, f3: 60, f4: 60, f5: 40, f6: 60, f7: 40 };
    const result = calcularMadurezGlobal(input);
    // ponderado = 80*0.20 + 40*0.20 + 40*0.25 + 60*0.20 + 40*0.15
    //           = 16 + 8 + 10 + 12 + 6 = 52
    // valor = 1 + (52/100)*4 = 1 + 2.08 = 3.08
    expect(result.ponderado).toBe(52);
    expect(result.valor).toBe(3.08);
    expect(result.etiqueta).toBe('Definido');
  });

  it('all zeros -> Inicial', () => {
    const input: MadurezInput = { f1: 0, f2: 0, f3: 0, f4: 0, f5: 0, f6: 0, f7: 0 };
    const result = calcularMadurezGlobal(input);
    expect(result.valor).toBe(1);
    expect(result.etiqueta).toBe('Inicial');
  });

  it('all 100 -> Optimizado', () => {
    const input: MadurezInput = { f1: 100, f2: 100, f3: 100, f4: 100, f5: 100, f6: 100, f7: 100 };
    const result = calcularMadurezGlobal(input);
    expect(result.valor).toBe(5);
    expect(result.etiqueta).toBe('Optimizado');
  });

  it('all 50 -> Gestionado/Definido boundary', () => {
    const input: MadurezInput = { f1: 50, f2: 50, f3: 50, f4: 50, f5: 50, f6: 50, f7: 50 };
    const result = calcularMadurezGlobal(input);
    // ponderado = 50 * (0.20+0.20+0.25+0.20+0.15) = 50
    // valor = 1 + 2 = 3
    expect(result.valor).toBe(3);
    expect(result.etiqueta).toBe('Definido');
  });
});

describe('madurezPorFase', () => {
  it('returns 7 phases', () => {
    const input: MadurezInput = { f1: 80, f2: 40, f3: 60, f4: 60, f5: 40, f6: 60, f7: 40 };
    const result = madurezPorFase(input);
    expect(result).toHaveLength(7);
  });

  it('each phase has nivel and etiqueta', () => {
    const input: MadurezInput = { f1: 100, f2: 0, f3: 50, f4: 25, f5: 75, f6: 10, f7: 90 };
    const result = madurezPorFase(input);
    for (const fase of result) {
      expect(fase).toHaveProperty('nivel');
      expect(fase).toHaveProperty('etiqueta');
      expect(['Inicial', 'Gestionado', 'Definido', 'Controlado', 'Optimizado']).toContain(fase.etiqueta);
    }
  });

  it('F1=100 -> nivel 5, Optimizado', () => {
    const input: MadurezInput = { f1: 100, f2: 0, f3: 0, f4: 0, f5: 0, f6: 0, f7: 0 };
    const result = madurezPorFase(input);
    expect(result[0]!.nivel).toBe(5);
    expect(result[0]!.etiqueta).toBe('Optimizado');
  });

  it('F2=0 -> nivel 1, Inicial', () => {
    const input: MadurezInput = { f1: 0, f2: 0, f3: 0, f4: 0, f5: 0, f6: 0, f7: 0 };
    const result = madurezPorFase(input);
    expect(result[1]!.nivel).toBe(1);
    expect(result[1]!.etiqueta).toBe('Inicial');
  });
});
