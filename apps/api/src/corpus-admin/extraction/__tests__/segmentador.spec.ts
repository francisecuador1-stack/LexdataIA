import { segmentar } from '../segmentador';

describe('segmentar', () => {
  describe('NACIONAL — LOPDP style (Art. N)', () => {
    it('segments articles with "Art. N" pattern', () => {
      const texto = `
Art. 7.- Consentimiento del titular
El tratamiento de datos personales requiere el consentimiento libre,
específico, informado e inequívoco del titular.

Art. 9.- Interés legítimo
El responsable podrá tratar datos personales sin el consentimiento
del titular cuando exista un interés legítimo.

Art. 10.- Principios del tratamiento
Los datos personales serán tratados conforme a los principios de
juridicidad, transparencia, finalidad y minimización.
`;

      const result = segmentar({ texto, tipo: 'NACIONAL', fuente: 'LOPDP' });

      expect(result).toHaveLength(3);
      expect(result[0]!.identificador).toBe('Art. 7');
      expect(result[1]!.identificador).toBe('Art. 9');
      expect(result[2]!.identificador).toBe('Art. 10');
      expect(result[0]!.metodoExtraccion).toBe('regex');
      expect(result[0]!.confianza).toBe(0.95);
    });

    it('handles "Artículo" full word', () => {
      const texto = `Artículo 12-A.- Tratamiento especial\nContenido del artículo.`;
      const result = segmentar({ texto, tipo: 'NACIONAL', fuente: 'LOPDP' });

      expect(result).toHaveLength(1);
      expect(result[0]!.identificador).toBe('Art. 12-A');
    });

    it('handles Disposiciones Transitorias', () => {
      const texto = `
Disposición Transitoria Primera
La presente Ley entrará en vigor dentro de dos años.

Disposición General Segunda
El órgano regulador emitirá la normativa secundaria.
`;

      const result = segmentar({ texto, tipo: 'NACIONAL', fuente: 'LOPDP' });

      expect(result).toHaveLength(2);
      expect(result[0]!.identificador).toContain('Disp.');
    });

    it('returns empty array for text with no articles', () => {
      const texto = 'Este es un preámbulo sin artículos numerados.';
      const result = segmentar({ texto, tipo: 'NACIONAL', fuente: 'LOPDP' });
      expect(result).toHaveLength(0);
    });

    it('calculates page numbers from pageBreaks', () => {
      const texto = 'Art. 1.- Primero\nContenido de la primera página.\n\nArt. 2.- Segundo\nContenido de la segunda.';
      // Page break after the first article content
      const breakPos = texto.indexOf('Art. 2') - 1;
      const pageBreaks = [breakPos];

      const result = segmentar({ texto, tipo: 'NACIONAL', fuente: 'CRE', pageBreaks });
      expect(result).toHaveLength(2);
      expect(result[0]!.paginaInicio).toBe(1);
      expect(result[1]!.paginaInicio).toBe(2);
    });
  });

  describe('INTERNACIONAL — ISO style (N.N.N)', () => {
    it('segments ISO numbered sections', () => {
      const texto = `
6.1 Acciones para abordar riesgos
La organización debe determinar los riesgos y oportunidades.

6.1.2 Evaluación de riesgos de seguridad
La organización debe definir un proceso de evaluación.

8.2 Evaluación de riesgos de seguridad de la información
La organización debe realizar evaluaciones periódicas.
`;

      const result = segmentar({ texto, tipo: 'INTERNACIONAL', fuente: 'ISO_27001' });

      expect(result.length).toBeGreaterThanOrEqual(2);
      // ISO patterns: "6.1", "6.1.2", "8.2"
      const ids = result.map((r) => r.identificador);
      expect(ids.some((id) => id.includes('6.1'))).toBe(true);
      expect(ids.some((id) => id.includes('8.2'))).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('handles article that starts mid-document', () => {
      const texto = `Preámbulo y consideraciones previas.\n\nArt. 7.- Consentimiento\nTexto del artículo.`;
      const result = segmentar({ texto, tipo: 'NACIONAL', fuente: 'LOPDP' });

      expect(result).toHaveLength(1);
      expect(result[0]!.identificador).toBe('Art. 7');
      // The segment should include text from "Art. 7" to the end
      expect(result[0]!.textoNormativo).toContain('Consentimiento');
    });

    it('handles article with dot-separated number (Art. 66.19)', () => {
      const texto = `Art. 66.19.- Derecho a la protección de datos\nContenido del artículo.`;
      const result = segmentar({ texto, tipo: 'NACIONAL', fuente: 'CRE' });

      expect(result).toHaveLength(1);
      // Should capture "66.19" as the identifier
      expect(result[0]!.identificador).toContain('66');
    });
  });
});
