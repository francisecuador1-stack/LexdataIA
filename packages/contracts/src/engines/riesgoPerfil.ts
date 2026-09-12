/** Motor de riesgo del perfil de cliente. */
export interface PerfilClienteInput {
  trataDatosSensibles: boolean;
  decisionesAutomatizadas: boolean;
  perfilamiento: boolean;
  sector: string;
  menoresEdad: boolean;
  brechaPreviaReportada: boolean;
  transferenciaInternacional: boolean;
  encargadoExterno: boolean;
  videovigilancia: boolean;
}

export function calcularRiesgoPerfil(input: PerfilClienteInput): { puntaje: number; nivel: string } {
  let puntaje = 0;
  if (input.trataDatosSensibles) puntaje += 3;
  if (input.decisionesAutomatizadas || input.perfilamiento) puntaje += 2;
  if (['Salud y Medicina', 'Finanzas/Banca/Seguros', 'Gobierno/Sector Público'].includes(input.sector)) puntaje += 2;
  if (input.menoresEdad || input.brechaPreviaReportada) puntaje += 2;
  if (input.transferenciaInternacional) puntaje += 1;
  if (input.encargadoExterno) puntaje += 1;
  if (input.videovigilancia) puntaje += 1;

  const nivel = puntaje >= 8 ? 'Crítico' : puntaje >= 5 ? 'Alto' : puntaje >= 3 ? 'Medio' : 'Bajo';
  return { puntaje, nivel };
}
