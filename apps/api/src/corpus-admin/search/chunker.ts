/**
 * Contextual chunker for legal norms.
 *
 * §7.1: One chunk per article if ≤ 1000 tokens.
 * If exceeds: divide by numerals/incisos with ~15% overlap.
 * Always prepend hierarchical header to each chunk.
 */

import { createHash } from 'crypto';

export interface ChunkInput {
  normaId: string;
  codigo: string;
  identificador: string;
  fuente: string;
  tipo: string;
  fasePHVA: string;
  organismoEmisor: string;
  version: string;
  textoNormativo: string;
  titulo: string;
}

export interface ChunkOutput {
  contenido: string;
  encabezado: string;
  orden: number;
  tokens: number;
  hashSha256: string;
  metadata: Record<string, unknown>;
}

const MAX_TOKENS = 1000;
// Rough approximation: 1 token ≈ 4 chars for Spanish
const CHARS_PER_TOKEN = 4;
const MAX_CHARS = MAX_TOKENS * CHARS_PER_TOKEN;
const OVERLAP_RATIO = 0.15;

/**
 * Chunk a norma's text into contextual pieces for embedding.
 *
 * §7.1: prepend hierarchical header, respect token limit, overlap.
 */
export function chunkar(input: ChunkInput): ChunkOutput[] {
  const encabezado = buildEncabezado(input);
  const texto = input.textoNormativo;

  // Estimate tokens
  const totalTokens = estimateTokens(texto);

  if (totalTokens <= MAX_TOKENS) {
    // Single chunk
    const contenido = `${encabezado}\n\n${texto}`;
    return [
      {
        contenido,
        encabezado,
        orden: 0,
        tokens: estimateTokens(contenido),
        hashSha256: hashContent(contenido),
        metadata: buildMetadata(input, 0),
      },
    ];
  }

  // Split by numerals/incisos: "1.", "a)", "literal a)", numbered lists
  const parts = splitByStructure(texto);
  const chunks: ChunkOutput[] = [];
  let currentChunk = '';
  let chunkIndex = 0;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]!;
    const candidate = currentChunk ? `${currentChunk}\n\n${part}` : part;

    if (estimateTokens(candidate) > MAX_CHARS / CHARS_PER_TOKEN && currentChunk) {
      // Flush current chunk
      const contenido = `${encabezado}\n\n${currentChunk}`;
      chunks.push({
        contenido,
        encabezado,
        orden: chunkIndex,
        tokens: estimateTokens(contenido),
        hashSha256: hashContent(contenido),
        metadata: buildMetadata(input, chunkIndex),
      });
      chunkIndex++;

      // Overlap: start new chunk with tail of previous
      const overlapChars = Math.floor(currentChunk.length * OVERLAP_RATIO);
      const overlapText = currentChunk.slice(-overlapChars);
      currentChunk = overlapText + '\n\n' + part;
    } else {
      currentChunk = candidate;
    }
  }

  // Flush remaining
  if (currentChunk) {
    const contenido = `${encabezado}\n\n${currentChunk}`;
    chunks.push({
      contenido,
      encabezado,
      orden: chunkIndex,
      tokens: estimateTokens(contenido),
      hashSha256: hashContent(contenido),
      metadata: buildMetadata(input, chunkIndex),
    });
  }

  return chunks;
}

/**
 * Build hierarchical header: "LOPDP > Título III > Art. 7 — Consentimiento"
 */
function buildEncabezado(input: ChunkInput): string {
  return `${input.fuente} > ${input.identificador} — ${input.titulo}`;
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

function hashContent(content: string): string {
  // Canonicalize before hashing for idempotency (§7.1)
  const canonical = content.replace(/\s+/g, ' ').trim();
  return createHash('sha256').update(canonical).digest('hex');
}

function buildMetadata(input: ChunkInput, orden: number): Record<string, unknown> {
  return {
    codigo: input.codigo,
    identificador: input.identificador,
    fuente: input.fuente,
    tipo: input.tipo,
    fasePHVA: input.fasePHVA,
    organismoEmisor: input.organismoEmisor,
    version: input.version,
    orden,
  };
}

/**
 * Split text by structural markers: numbered items, lettered incisos, paragraphs.
 */
function splitByStructure(text: string): string[] {
  // Try splitting by numbered items first: "1.", "2.", etc.
  const byNumbers = text.split(/\n(?=\d+\.\s)/);
  if (byNumbers.length > 1) return byNumbers.map((p) => p.trim()).filter(Boolean);

  // Try splitting by lettered incisos: "a)", "b)", "literal a)"
  const byLetters = text.split(/\n(?=[a-z]\)\s|literal\s+[a-z]\))/i);
  if (byLetters.length > 1) return byLetters.map((p) => p.trim()).filter(Boolean);

  // Fallback: split by double newlines (paragraphs)
  const byParagraphs = text.split(/\n\n+/);
  return byParagraphs.map((p) => p.trim()).filter(Boolean);
}
