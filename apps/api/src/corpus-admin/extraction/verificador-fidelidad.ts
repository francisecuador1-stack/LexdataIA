/**
 * Fidelity verifier for extracted articles.
 *
 * §6 step 4: normalize both the extracted text and the source,
 * then check that the extracted text exists as a substring.
 *
 * This prevents hallucinated or paraphrased text from being
 * published as legal content.
 */

/**
 * Normalize text for fidelity comparison.
 * - Lowercase
 * - Collapse whitespace (spaces, tabs, newlines → single space)
 * - Remove soft hyphens and line-break hyphens (e.g., "regla-\nmentación" → "reglamentación")
 * - Strip non-breaking spaces
 */
export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .replace(/\u00ad/g, '')           // soft hyphen
    .replace(/\u00a0/g, ' ')          // non-breaking space
    .replace(/-\s*\n\s*/g, '')        // line-break hyphens
    .replace(/\s+/g, ' ')            // collapse whitespace
    .trim();
}

/**
 * Verify that `extracto` appears (after normalization) as a substring
 * of `fuenteCompleta`.
 *
 * Returns true if the extracted text is faithful to the source.
 */
export function verificarFidelidad(
  extracto: string,
  fuenteCompleta: string,
): boolean {
  const normExtracto = normalizar(extracto);
  const normFuente = normalizar(fuenteCompleta);

  // Full substring match required — no partial fallback
  // (D.5: the 200-char head fallback allowed fabricated body text to pass)
  return normFuente.includes(normExtracto);
}
