import { describe, it, expect } from 'vitest';
import { calcularBrechaControles, ControlCount } from '../brechaControles.js';

describe('calcularBrechaControles', () => {
  it('all implemented -> ADECUADO', () => {
    const controles: ControlCount[] = [
      { categoria: 'Técnicos', necesarios: 10, implementados: 10 },
      { categoria: 'Organizativos', necesarios: 8, implementados: 8 },
    ];
    const result = calcularBrechaControles(controles);
    expect(result.porcentajeGlobal).toBe(100);
    expect(result.veredicto).toBe('ADECUADO');
    expect(result.faltantes).toBe(0);
  });

  it('80% -> ADECUADO', () => {
    const controles: ControlCount[] = [
      { categoria: 'Técnicos', necesarios: 10, implementados: 8 },
    ];
    const result = calcularBrechaControles(controles);
    expect(result.porcentajeGlobal).toBe(80);
    expect(result.veredicto).toBe('ADECUADO');
  });

  it('50-79% -> PARCIAL', () => {
    const controles: ControlCount[] = [
      { categoria: 'Técnicos', necesarios: 10, implementados: 6 },
      { categoria: 'Organizativos', necesarios: 10, implementados: 5 },
    ];
    const result = calcularBrechaControles(controles);
    expect(result.porcentajeGlobal).toBe(55);
    expect(result.veredicto).toBe('PARCIAL');
    expect(result.faltantes).toBe(9);
  });

  it('<50% -> INSUFICIENTE', () => {
    const controles: ControlCount[] = [
      { categoria: 'Técnicos', necesarios: 10, implementados: 2 },
      { categoria: 'Organizativos', necesarios: 10, implementados: 1 },
    ];
    const result = calcularBrechaControles(controles);
    expect(result.porcentajeGlobal).toBe(15);
    expect(result.veredicto).toBe('INSUFICIENTE');
  });

  it('empty list -> ADECUADO (no controls needed)', () => {
    const result = calcularBrechaControles([]);
    expect(result.porcentajeGlobal).toBe(100);
    expect(result.veredicto).toBe('ADECUADO');
  });

  it('zero necesarios in a category -> 100% for that category', () => {
    const controles: ControlCount[] = [
      { categoria: 'Documentales', necesarios: 0, implementados: 0 },
    ];
    const result = calcularBrechaControles(controles);
    expect(result.detalle[0]!.porcentaje).toBe(100);
  });

  it('detalle contains per-category percentages', () => {
    const controles: ControlCount[] = [
      { categoria: 'Técnicos', necesarios: 10, implementados: 5 },
      { categoria: 'Jurídicos', necesarios: 4, implementados: 4 },
    ];
    const result = calcularBrechaControles(controles);
    expect(result.detalle[0]!.porcentaje).toBe(50);
    expect(result.detalle[1]!.porcentaje).toBe(100);
    // Global: 9/14 = 64%
    expect(result.porcentajeGlobal).toBe(64);
    expect(result.veredicto).toBe('PARCIAL');
  });
});
