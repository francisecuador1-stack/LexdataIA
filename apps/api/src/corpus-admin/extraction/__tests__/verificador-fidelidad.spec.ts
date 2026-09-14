import { normalizar, verificarFidelidad } from '../verificador-fidelidad';

describe('normalizar', () => {
  it('lowercases text', () => {
    expect(normalizar('HOLA Mundo')).toBe('hola mundo');
  });

  it('collapses whitespace', () => {
    expect(normalizar('foo   bar\n\nbaz')).toBe('foo bar baz');
  });

  it('removes soft hyphens', () => {
    expect(normalizar('regla\u00admentación')).toBe('reglamentación');
  });

  it('removes line-break hyphens', () => {
    expect(normalizar('regla-\nmentación')).toBe('reglamentación');
  });

  it('handles non-breaking spaces', () => {
    expect(normalizar('foo\u00a0bar')).toBe('foo bar');
  });
});

describe('verificarFidelidad', () => {
  const fuente = `
    Art. 7.- Consentimiento del titular. El tratamiento de datos personales
    requiere el consentimiento libre, específico, informado e inequívoco
    del titular de los datos personales. El consentimiento deberá ser
    manifestación de voluntad libre, otorgada de manera inequívoca.
  `;

  it('accepts exact text', () => {
    const extracto =
      'Art. 7.- Consentimiento del titular. El tratamiento de datos personales ' +
      'requiere el consentimiento libre, específico, informado e inequívoco ' +
      'del titular de los datos personales.';

    expect(verificarFidelidad(extracto, fuente)).toBe(true);
  });

  it('accepts text with different whitespace', () => {
    const extracto =
      'Art. 7.- Consentimiento del titular.  El tratamiento de datos personales\n' +
      'requiere el consentimiento libre,   específico, informado e inequívoco\n' +
      'del titular de los datos personales.';

    expect(verificarFidelidad(extracto, fuente)).toBe(true);
  });

  it('accepts text with line-break hyphens removed', () => {
    const fuenteConGuiones = 'El consenti-\nmiento libre.';
    const extracto = 'El consentimiento libre.';

    expect(verificarFidelidad(extracto, fuenteConGuiones)).toBe(true);
  });

  it('rejects paraphrased text', () => {
    const extracto =
      'Los datos de las personas se tratan con su consentimiento explícito ' +
      'y libre, de acuerdo con la normativa vigente.';

    expect(verificarFidelidad(extracto, fuente)).toBe(false);
  });

  it('rejects completely fabricated text', () => {
    const extracto =
      'El responsable del tratamiento deberá implementar medidas técnicas ' +
      'y organizativas para garantizar la seguridad de los datos.';

    expect(verificarFidelidad(extracto, fuente)).toBe(false);
  });

  it('accepts matching head (first 200 chars) even if tail differs', () => {
    // This tests the fallback: if the first ~200 normalized chars match,
    // it passes even if the rest has formatting artifacts.
    // We use a substantial prefix that's definitely > 50 chars after normalization.
    const extracto =
      'Art. 7.- Consentimiento del titular. El tratamiento de datos personales ' +
      'requiere el consentimiento libre, específico, informado e inequívoco ' +
      'del titular de los datos personales. El consentimiento deberá ser ' +
      'manifestación de voluntad libre, otorgada de manera inequívoca. ' +
      '\n\n[ARTEFACTO: este texto no existe en el documento fuente y rompe la coincidencia completa]';

    expect(verificarFidelidad(extracto, fuente)).toBe(true);
  });
});
