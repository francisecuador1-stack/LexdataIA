import { createHash } from 'crypto';
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { parse } from 'yaml';
import { join } from 'path';

interface NormaYaml {
  codigo: string;
  version: string;
  titulo: string;
  texto_normativo: string;
  controles?: Array<{ titulo: string; evidencia_requerida: string }>;
}

interface LockEntry {
  codigo: string;
  hash: string;
  version: string;
}

function sha256(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

function canonicalize(norma: NormaYaml): string {
  return JSON.stringify({
    codigo: norma.codigo,
    version: norma.version,
    titulo: norma.titulo,
    texto_normativo: norma.texto_normativo,
  }, null, 0);
}

const corpusDir = join(import.meta.dirname, '..', 'corpus');
const lockPath = join(import.meta.dirname, '..', 'corpus.lock.json');

const entries: LockEntry[] = [];
let controlCount = 0;

for (const subdir of ['nacional', 'internacional']) {
  const dir = join(corpusDir, subdir);
  let files: string[];
  try { files = readdirSync(dir).filter(f => f.endsWith('.yaml')); } catch { continue; }
  for (const file of files) {
    const content = readFileSync(join(dir, file), 'utf8');
    const normas: NormaYaml[] = parse(content);
    for (const norma of normas) {
      const hash = sha256(canonicalize(norma));
      entries.push({ codigo: norma.codigo, hash, version: norma.version });
      if (norma.controles) controlCount += norma.controles.length;
    }
  }
}

// Check for hash changes without version bump
let existingLock: LockEntry[] = [];
try {
  existingLock = JSON.parse(readFileSync(lockPath, 'utf8'));
} catch { /* first run */ }

for (const entry of entries) {
  const existing = existingLock.find(e => e.codigo === entry.codigo);
  if (existing && existing.hash !== entry.hash && existing.version === entry.version) {
    console.error(`ERROR: Hash changed for ${entry.codigo} without version bump!`);
    process.exit(1);
  }
}

writeFileSync(lockPath, JSON.stringify(entries, null, 2));
console.log(`corpus.lock.json: ${entries.length} normas, ${controlCount} controles`);
