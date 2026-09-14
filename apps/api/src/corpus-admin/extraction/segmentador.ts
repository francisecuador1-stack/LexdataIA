/**
 * Regex-first segmentador for legal documents.
 *
 * Splits plain text into article-level segments using patterns
 * specific to Ecuadorian legislation and ISO standards.
 *
 * §6 step 2 of the spec.
 */

export interface SegmentoExtraido {
  identificador: string;
  titulo: string;
  textoNormativo: string;
  paginaInicio?: number;
  offsetInicio: number;
  offsetFin: number;
  metodoExtraccion: 'regex';
  confianza: number;
}

// RN-004: §6.2 — Patrones por tipo de fuente
const PATRONES_NACIONAL = [
  // "Art. 7", "Artículo 7", "Art. 12-A", "Art. 66.19"
  /^[ \t]*Art(?:ículo|\.)\s*(\d+(?:[.\-]\d+)*(?:[.\-][A-Za-z])?)\s*[.\-–—]?\s*/gim,
  // Disposiciones transitorias, derogatorias, etc.
  /^[ \t]*(?:Disposición|DISPOSICIÓN)\s+(General|Transitoria|Derogatoria|Final)\s+(\w+)/gim,
];

const PATRONES_INTERNACIONAL = [
  // ISO: "6.1.2 Evaluación de riesgos", "A.5.1 Information security policies"
  /^[ \t]*(\d+(?:\.\d+){0,3})\s+[A-ZÁÉÍÓÚÑ]/gm,
  // §-style
  /^[ \t]*§\s*(\d+(?:\.\d+)*)/gm,
];

interface SegmentarOptions {
  texto: string;
  tipo: 'NACIONAL' | 'INTERNACIONAL';
  fuente: string;
  /** Offset positions of page breaks (for paginaInicio calculation) */
  pageBreaks?: number[];
}

/**
 * Segment text into articles using regex patterns.
 *
 * Returns segments in document order. Each segment contains the full text
 * from its header to the start of the next header (or end of document).
 */
export function segmentar(opts: SegmentarOptions): SegmentoExtraido[] {
  const { texto, tipo, fuente, pageBreaks } = opts;
  const patrones = tipo === 'NACIONAL' ? PATRONES_NACIONAL : PATRONES_INTERNACIONAL;

  // Collect all match positions
  const matches: Array<{ index: number; identificador: string; lineText: string }> = [];

  for (const patron of patrones) {
    // Reset regex state
    const re = new RegExp(patron.source, patron.flags);
    let match: RegExpExecArray | null;
    while ((match = re.exec(texto)) !== null) {
      const identificador = buildIdentificador(match, tipo, fuente);
      // Get the full line for title extraction
      const lineEnd = texto.indexOf('\n', match.index);
      const lineText = texto.slice(match.index, lineEnd === -1 ? undefined : lineEnd).trim();
      matches.push({ index: match.index, identificador, lineText });
    }
  }

  // Sort by position in document
  matches.sort((a, b) => a.index - b.index);

  // Deduplicate overlapping matches (keep earlier one)
  const deduped = matches.filter(
    (m, i) => i === 0 || m.index - matches[i - 1]!.index > 10,
  );

  if (deduped.length === 0) return [];

  // Build segments: each runs from its header to the next
  const segments: SegmentoExtraido[] = [];

  for (let i = 0; i < deduped.length; i++) {
    const current = deduped[i]!;
    const next = deduped[i + 1];
    const offsetInicio = current.index;
    const offsetFin = next ? next.index - 1 : texto.length;
    const textoNormativo = texto.slice(offsetInicio, offsetFin).trim();

    // Extract title from first line (after the identifier)
    const titulo = extractTitulo(current.lineText, current.identificador);

    // Calculate page from page breaks
    const paginaInicio = pageBreaks
      ? pageBreaks.filter((pb) => pb <= offsetInicio).length + 1
      : undefined;

    segments.push({
      identificador: current.identificador,
      titulo: titulo || current.identificador,
      textoNormativo,
      paginaInicio,
      offsetInicio,
      offsetFin,
      metodoExtraccion: 'regex',
      confianza: 0.95,
    });
  }

  return segments;
}

function buildIdentificador(
  match: RegExpExecArray,
  tipo: string,
  fuente: string,
): string {
  if (tipo === 'NACIONAL') {
    // Check if it's a Disposición
    if (match[0]?.match(/Disposici[oó]n/i)) {
      return `Disp. ${match[1]} ${match[2]}`;
    }
    return `Art. ${match[1]}`;
  }
  // ISO/NIST
  return `§${match[1]}`;
}

function extractTitulo(lineText: string, identificador: string): string {
  // Remove the identifier prefix from the line
  const afterId = lineText
    .replace(/^[ \t]*Art(?:ículo|\.)\s*\S+\s*[.\-–—]?\s*/i, '')
    .replace(/^[ \t]*§\s*\S+\s*/i, '')
    .replace(/^[ \t]*\d+(?:\.\d+)*\s+/i, '')
    .replace(/^[ \t]*(?:Disposición|DISPOSICIÓN)\s+\w+\s+\w+\s*[.\-–—]?\s*/i, '')
    .trim();

  // Truncate to ~120 chars for title
  if (afterId.length > 120) return afterId.slice(0, 117) + '…';
  return afterId;
}
