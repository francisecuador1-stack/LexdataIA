/** RN-701: Madurez global del SGPDP. */
export interface MadurezInput {
  f1: number; // 0-100 percentage
  f2: number;
  f3: number;
  f4: number;
  f5: number;
  f6: number;
  f7: number;
}

const PESOS = { f1: 0.20, f2: 0.20, f5: 0.25, f6: 0.20, f7: 0.15 };
const ETIQUETAS = ['Inicial', 'Gestionado', 'Definido', 'Controlado', 'Optimizado'] as const;

export function calcularMadurezGlobal(input: MadurezInput) {
  const ponderado = input.f1 * PESOS.f1 + input.f2 * PESOS.f2 + input.f5 * PESOS.f5 + input.f6 * PESOS.f6 + input.f7 * PESOS.f7;
  // Normalize 0-100 to 1-5 scale
  const valor = 1 + (ponderado / 100) * 4;
  const valorRedondeado = Math.round(valor * 100) / 100;
  const nivelIdx = Math.min(Math.floor(valor) - 1, 4);
  const etiqueta = ETIQUETAS[Math.max(0, nivelIdx)];
  return { valor: valorRedondeado, etiqueta, ponderado };
}

export function madurezPorFase(input: MadurezInput) {
  const fases = [
    { fase: 'F1', porcentaje: input.f1 },
    { fase: 'F2', porcentaje: input.f2 },
    { fase: 'F3', porcentaje: input.f3 },
    { fase: 'F4', porcentaje: input.f4 },
    { fase: 'F5', porcentaje: input.f5 },
    { fase: 'F6', porcentaje: input.f6 },
    { fase: 'F7', porcentaje: input.f7 },
  ];
  return fases.map(f => {
    const nivel = 1 + (f.porcentaje / 100) * 4;
    const idx = Math.min(Math.floor(nivel) - 1, 4);
    return { ...f, nivel: Math.round(nivel * 100) / 100, etiqueta: ETIQUETAS[Math.max(0, idx)] };
  });
}
