import { createHash } from 'crypto';
import { readFileSync, readdirSync } from 'fs';
import { parse } from 'yaml';
import { join } from 'path';

// ── Types ────────────────────────────────────────────────────

export interface NormaYaml {
  codigo: string;
  fuente: string;
  tipo: string;
  identificador: string;
  titulo: string;
  categoria: string;
  resumen_ejecutivo: string;
  texto_normativo: string;
  organismo_emisor: string;
  fecha_emision: string;
  version: string;
  estado: string;
  fase_phva: string;
  modulos_relacionados: string[];
  controles?: ControlYaml[];
}

export interface ControlYaml {
  titulo: string;
  descripcion: string;
  evidencia_requerida: string;
  fase_phva: string;
}

export interface LockEntry {
  codigo: string;
  hash: string;
  version: string;
}

// ── Hashing ──────────────────────────────────────────────────

export function sha256(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

/** Deterministic serialization of the fields that define a norma's identity. */
export function canonicalize(norma: {
  codigo: string;
  version: string;
  titulo: string;
  texto_normativo: string;
}): string {
  return JSON.stringify(
    {
      codigo: norma.codigo,
      version: norma.version,
      titulo: norma.titulo,
      texto_normativo: norma.texto_normativo,
    },
    null,
    0,
  );
}

// ── Corpus loading ───────────────────────────────────────────

/**
 * Read all YAML files from corpus/nacional and corpus/internacional.
 * `baseDir` is the root of the legal-corpus package.
 */
export function loadCorpusYaml(baseDir: string): NormaYaml[] {
  const normas: NormaYaml[] = [];
  for (const subdir of ['nacional', 'internacional']) {
    const dir = join(baseDir, 'corpus', subdir);
    let files: string[];
    try {
      files = readdirSync(dir).filter((f) => f.endsWith('.yaml'));
    } catch {
      continue;
    }
    for (const file of files) {
      const content = readFileSync(join(dir, file), 'utf8');
      const parsed: NormaYaml[] = parse(content);
      normas.push(...parsed);
    }
  }
  return normas;
}

/** Read and parse corpus.lock.json. Returns a Map keyed by codigo. */
export function loadLockFile(baseDir: string): Map<string, LockEntry> {
  const lockPath = join(baseDir, 'corpus.lock.json');
  const data: LockEntry[] = JSON.parse(readFileSync(lockPath, 'utf8'));
  return new Map(data.map((e) => [e.codigo, e]));
}

/**
 * Load the full corpus and verify every norma's hash against the lock file.
 * Throws on any mismatch — fails loudly.
 */
export function loadAndVerifyCorpus(baseDir: string): {
  normas: NormaYaml[];
  lockMap: Map<string, LockEntry>;
} {
  const normas = loadCorpusYaml(baseDir);
  const lockMap = loadLockFile(baseDir);

  for (const n of normas) {
    const lockEntry = lockMap.get(n.codigo);
    if (!lockEntry) {
      throw new Error(
        `Norma ${n.codigo} not found in corpus.lock.json. Run 'pnpm --filter legal-corpus hash' first.`,
      );
    }
    const computed = sha256(canonicalize(n));
    if (computed !== lockEntry.hash) {
      throw new Error(
        `Hash mismatch for ${n.codigo}: computed=${computed}, lock=${lockEntry.hash}. ` +
          `YAML may have changed without running 'pnpm --filter legal-corpus hash'.`,
      );
    }
  }

  return { normas, lockMap };
}
