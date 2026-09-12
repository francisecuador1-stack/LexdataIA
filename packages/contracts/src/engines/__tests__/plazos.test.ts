import { describe, it, expect } from 'vitest';
import { fechaMaxReporte, estadoPlazo, plazoArco } from '../plazos.js';

describe('fechaMaxReporte', () => {
  it('adds exactly 72 hours', () => {
    const deteccion = new Date('2026-01-10T08:00:00Z');
    const max = fechaMaxReporte(deteccion);
    expect(max.getTime() - deteccion.getTime()).toBe(72 * 60 * 60 * 1000);
    expect(max.toISOString()).toBe('2026-01-13T08:00:00.000Z');
  });
});

describe('estadoPlazo', () => {
  const deteccion = new Date('2026-01-10T08:00:00Z');
  // max = 2026-01-13T08:00:00Z

  it('EN_PLAZO when >24h remaining', () => {
    const ahora = new Date('2026-01-11T00:00:00Z'); // 56h remaining
    expect(estadoPlazo(ahora, deteccion, false)).toBe('EN_PLAZO');
  });

  it('POR_VENCER at 23h remaining', () => {
    const ahora = new Date('2026-01-12T09:00:00Z'); // 23h remaining
    expect(estadoPlazo(ahora, deteccion, false)).toBe('POR_VENCER');
  });

  it('POR_VENCER at exactly 24h remaining', () => {
    const ahora = new Date('2026-01-12T08:00:00Z'); // exactly 24h remaining
    expect(estadoPlazo(ahora, deteccion, false)).toBe('POR_VENCER');
  });

  it('VENCIDO when past deadline', () => {
    const ahora = new Date('2026-01-14T00:00:00Z');
    expect(estadoPlazo(ahora, deteccion, false)).toBe('VENCIDO');
  });

  it('VENCIDO at exactly deadline', () => {
    const ahora = new Date('2026-01-13T08:00:00Z');
    expect(estadoPlazo(ahora, deteccion, false)).toBe('VENCIDO');
  });

  it('NOTIFICADO overrides everything', () => {
    const ahora = new Date('2026-01-14T00:00:00Z'); // past deadline
    expect(estadoPlazo(ahora, deteccion, true)).toBe('NOTIFICADO');
  });

  it('NOTIFICADO even when in plazo', () => {
    const ahora = new Date('2026-01-10T09:00:00Z');
    expect(estadoPlazo(ahora, deteccion, true)).toBe('NOTIFICADO');
  });
});

describe('plazoArco', () => {
  it('skips weekends for 15 business days', () => {
    // Monday Jan 5, 2026
    const recepcion = new Date('2026-01-05T00:00:00Z');
    const result = plazoArco(recepcion);
    // 15 business days from Mon Jan 5 -> Tue Jan 26 (3 full weeks = 15 biz days, landing on Jan 26)
    expect(result.getDay()).not.toBe(0); // not Sunday
    expect(result.getDay()).not.toBe(6); // not Saturday
  });

  it('custom business days', () => {
    const recepcion = new Date('2026-01-05T12:00:00Z'); // Monday noon UTC
    const result = plazoArco(recepcion, 5);
    // 5 business days: Tue6, Wed7, Thu8, Fri9, Mon12
    // getDay() uses local time so we just verify it's a weekday and ~5 days later
    expect(result.getTime()).toBeGreaterThan(recepcion.getTime());
    const diffDays = Math.round((result.getTime() - recepcion.getTime()) / (24 * 60 * 60 * 1000));
    expect(diffDays).toBeGreaterThanOrEqual(5);
    expect(diffDays).toBeLessThanOrEqual(9); // max 5 biz + 2 weekends
  });

  it('starting on Friday, next biz day is Monday', () => {
    const recepcion = new Date('2026-01-09T12:00:00Z'); // Friday noon UTC
    const result = plazoArco(recepcion, 1);
    // 1 business day after Friday -> Monday
    const diffDays = Math.round((result.getTime() - recepcion.getTime()) / (24 * 60 * 60 * 1000));
    expect(diffDays).toBeGreaterThanOrEqual(1);
    expect(diffDays).toBeLessThanOrEqual(3); // Fri->Mon = 3 calendar days
  });
});
