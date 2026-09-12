/** RN-602: Reloj de 72h de incidentes (Art. 41) y plazos ARCO. */

export function fechaMaxReporte(deteccion: Date): Date {
  return new Date(deteccion.getTime() + 72 * 60 * 60 * 1000);
}

export type EstadoPlazo = 'EN_PLAZO' | 'POR_VENCER' | 'VENCIDO' | 'NOTIFICADO';

export function estadoPlazo(ahora: Date, deteccion: Date, notificado: boolean): EstadoPlazo {
  if (notificado) return 'NOTIFICADO';
  const max = fechaMaxReporte(deteccion);
  const diff = max.getTime() - ahora.getTime();
  if (diff <= 0) return 'VENCIDO';
  if (diff <= 24 * 60 * 60 * 1000) return 'POR_VENCER';
  return 'EN_PLAZO';
}

/** ARCO: 15 dias habiles desde recepcion. */
export function plazoArco(recepcion: Date, diasHabiles: number = 15): Date {
  const result = new Date(recepcion);
  let added = 0;
  while (added < diasHabiles) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return result;
}
