import { describe, it, expect } from 'vitest';
import { calcularScoreRiesgo } from '../riesgoMatriz.js';

describe('calcularScoreRiesgo', () => {
  it('5x3=15 -> Critico, requiereEipd true', () => {
    const result = calcularScoreRiesgo(5, 3);
    expect(result.score).toBe(15);
    expect(result.nivel).toBe('Crítico');
    expect(result.requiereEipd).toBe(true);
  });

  it('4x3=12 -> Alto, requiereEipd true', () => {
    const result = calcularScoreRiesgo(4, 3);
    expect(result.score).toBe(12);
    expect(result.nivel).toBe('Alto');
    expect(result.requiereEipd).toBe(true);
  });

  it('3x2=6 -> Medio, requiereEipd false', () => {
    const result = calcularScoreRiesgo(3, 2);
    expect(result.score).toBe(6);
    expect(result.nivel).toBe('Medio');
    expect(result.requiereEipd).toBe(false);
  });

  it('1x1=1 -> Bajo, requiereEipd false', () => {
    const result = calcularScoreRiesgo(1, 1);
    expect(result.score).toBe(1);
    expect(result.nivel).toBe('Bajo');
    expect(result.requiereEipd).toBe(false);
  });

  it('2x4=8 -> Alto, requiereEipd true', () => {
    const result = calcularScoreRiesgo(2, 4);
    expect(result.score).toBe(8);
    expect(result.nivel).toBe('Alto');
    expect(result.requiereEipd).toBe(true);
  });

  it('boundary: 2x2=4 -> Medio, requiereEipd false', () => {
    const result = calcularScoreRiesgo(2, 2);
    expect(result.score).toBe(4);
    expect(result.nivel).toBe('Medio');
    expect(result.requiereEipd).toBe(false);
  });
});
