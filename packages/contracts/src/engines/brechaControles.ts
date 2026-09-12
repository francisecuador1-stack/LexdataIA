/** Cumplimiento ponderado de controles por categoria. */
export interface ControlCount {
  categoria: string; // Tecnicos, Organizativos, Juridicos, Documentales
  necesarios: number;
  implementados: number;
}

export function calcularBrechaControles(controles: ControlCount[]) {
  let totalNecesarios = 0;
  let totalImplementados = 0;
  const detalle = controles.map(c => {
    const pct = c.necesarios > 0 ? Math.round((c.implementados / c.necesarios) * 100) : 100;
    totalNecesarios += c.necesarios;
    totalImplementados += c.implementados;
    return { ...c, porcentaje: pct };
  });
  const porcentajeGlobal = totalNecesarios > 0 ? Math.round((totalImplementados / totalNecesarios) * 100) : 100;
  const veredicto = porcentajeGlobal >= 80 ? 'ADECUADO' : porcentajeGlobal >= 50 ? 'PARCIAL' : 'INSUFICIENTE';
  return { porcentajeGlobal, veredicto, totalNecesarios, totalImplementados, faltantes: totalNecesarios - totalImplementados, detalle };
}
