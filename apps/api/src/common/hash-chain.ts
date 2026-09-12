import { createHash } from 'crypto';

/**
 * Hash chain utility for LEXDATA IA — ensures tamper-evident records.
 *
 * Used by: evidencias (INV-3), audit_log (INV-4), documentos, certificados.
 *
 * Pattern (§13 of data model spec):
 *   hash       = sha256(content)
 *   prev_hash  = hash of previous row (chain_index - 1) or "GENESIS"
 *   row_hash   = sha256(prev_hash + "|" + hash + "|" + created_at.toISOString())
 */

const GENESIS = 'GENESIS';

/** SHA-256 hash of raw bytes (for file uploads / evidencias). */
export function hashBytes(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

/** SHA-256 hash of canonical JSON (for structured records: audit_log, documentos). */
export function hashJson(payload: Record<string, unknown>): string {
  const canonical = JSON.stringify(payload, Object.keys(payload).sort());
  return createHash('sha256').update(canonical, 'utf8').digest('hex');
}

/** Compute the chained row hash. */
export function chainHash(
  prevHash: string | null,
  contentHash: string,
  createdAt: Date,
): string {
  const prev = prevHash ?? GENESIS;
  const input = `${prev}|${contentHash}|${createdAt.toISOString()}`;
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

/** Build chain fields for a new row. */
export function buildChainFields(
  contentHash: string,
  prevRow: { hashSha256: string; chainIndex: number } | null,
  createdAt: Date = new Date(),
): { hashSha256: string; prevHash: string; chainIndex: number } {
  const prevHash = prevRow?.hashSha256 ?? GENESIS;
  const chainIndex = (prevRow?.chainIndex ?? -1) + 1;
  const rowHash = chainHash(prevHash, contentHash, createdAt);
  return { hashSha256: rowHash, prevHash, chainIndex };
}

/** Verify a chain segment. Returns the index of the first broken link, or -1 if intact. */
export function verifyChain(
  rows: Array<{ hashSha256: string; prevHash: string | null; chainIndex: number; createdAt: Date }>,
  recomputeContentHash?: (row: unknown) => string,
): number {
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const expectedPrev = i === 0 ? GENESIS : rows[i - 1].hashSha256;

    if (row.prevHash !== expectedPrev) return i;
    if (row.chainIndex !== i) return i;

    // If a content hash recomputer is provided, verify content integrity too
    if (recomputeContentHash) {
      const contentHash = recomputeContentHash(row);
      const expected = chainHash(expectedPrev, contentHash, row.createdAt);
      if (row.hashSha256 !== expected) return i;
    }
  }
  return -1;
}
