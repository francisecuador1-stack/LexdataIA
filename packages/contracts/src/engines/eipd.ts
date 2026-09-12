/** Art. 39 LOPDP: decision EIPD por tratamiento. */
export interface EipdInput {
  granEscala: boolean;
  datosSensibles: boolean;
  decisionesAutomatizadas: boolean;
  perfilamiento: boolean;
  menores: boolean;
}

export function decidirEipd(input: EipdInput) {
  const criterios = [input.granEscala, input.datosSensibles, input.decisionesAutomatizadas, input.perfilamiento, input.menores];
  const cumplidos = criterios.filter(Boolean).length;
  const puntajeMtge = cumplidos;
  // Obligatorio si 2+ criterios OR sensibles OR menores
  const decision = cumplidos >= 2 || input.datosSensibles || input.menores ? 'OBLIGATORIO' : 'NO_OBLIGATORIO';
  return { puntajeMtge, decision, cumplidos, criterios: { granEscala: input.granEscala, datosSensibles: input.datosSensibles, decisionesAutomatizadas: input.decisionesAutomatizadas, perfilamiento: input.perfilamiento, menores: input.menores } };
}
