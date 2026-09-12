/** RN-201: Matriz de riesgos 5x5. */
export function calcularScoreRiesgo(impacto: number, probabilidad: number) {
  const score = impacto * probabilidad;
  const nivel = score >= 15 ? 'Crítico' : score >= 8 ? 'Alto' : score >= 4 ? 'Medio' : 'Bajo';
  // RN-201: zona roja -> EIPD obligatoria
  const requiereEipd = score >= 12 || nivel === 'Alto' || nivel === 'Crítico';
  return { score, nivel, requiereEipd };
}
