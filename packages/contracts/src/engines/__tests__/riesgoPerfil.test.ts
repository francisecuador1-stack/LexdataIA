import { describe, it, expect } from 'vitest';
import { calcularRiesgoPerfil, PerfilClienteInput } from '../riesgoPerfil.js';

const EMPTY_PROFILE: PerfilClienteInput = {
  trataDatosSensibles: false,
  decisionesAutomatizadas: false,
  perfilamiento: false,
  sector: 'Otro',
  menoresEdad: false,
  brechaPreviaReportada: false,
  transferenciaInternacional: false,
  encargadoExterno: false,
  videovigilancia: false,
};

describe('calcularRiesgoPerfil', () => {
  it('empty profile -> Bajo', () => {
    const result = calcularRiesgoPerfil(EMPTY_PROFILE);
    expect(result.puntaje).toBe(0);
    expect(result.nivel).toBe('Bajo');
  });

  it('TecnoEcuador profile -> Alto', () => {
    const result = calcularRiesgoPerfil({
      ...EMPTY_PROFILE,
      decisionesAutomatizadas: true,
      perfilamiento: true,
      sector: 'Telecomunicaciones',
      transferenciaInternacional: true,
      encargadoExterno: true,
      videovigilancia: true,
    });
    // 2 (decisiones/perf) + 1 (transfer) + 1 (encargado) + 1 (video) = 5
    expect(result.puntaje).toBe(5);
    expect(result.nivel).toBe('Alto');
  });

  it('BancoPyme profile -> Critico', () => {
    const result = calcularRiesgoPerfil({
      ...EMPTY_PROFILE,
      trataDatosSensibles: true,
      decisionesAutomatizadas: true,
      sector: 'Finanzas/Banca/Seguros',
      menoresEdad: true,
      brechaPreviaReportada: true,
      transferenciaInternacional: true,
      encargadoExterno: true,
    });
    // 3 + 2 + 2 + 2 + 1 + 1 = 11
    expect(result.puntaje).toBe(11);
    expect(result.nivel).toBe('Crítico');
  });

  it('Medio range profile', () => {
    const result = calcularRiesgoPerfil({
      ...EMPTY_PROFILE,
      trataDatosSensibles: true,
    });
    expect(result.puntaje).toBe(3);
    expect(result.nivel).toBe('Medio');
  });

  it('high-risk sector adds 2 points', () => {
    const result = calcularRiesgoPerfil({
      ...EMPTY_PROFILE,
      sector: 'Salud y Medicina',
    });
    expect(result.puntaje).toBe(2);
    expect(result.nivel).toBe('Bajo');
  });
});
