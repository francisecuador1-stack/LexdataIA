import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import {
  sha256,
  canonicalize,
  loadCorpusYaml,
  type LockEntry,
} from '../src/index.js';

const corpusBase = join(import.meta.dirname, '..');
const lockPath = join(corpusBase, 'corpus.lock.json');

const normas = loadCorpusYaml(corpusBase);

const entries: LockEntry[] = [];
let controlCount = 0;

for (const norma of normas) {
  const hash = sha256(canonicalize(norma));
  entries.push({ codigo: norma.codigo, hash, version: norma.version });
  if (norma.controles) controlCount += norma.controles.length;
}

// Check for hash changes without version bump
let existingLock: LockEntry[] = [];
try {
  existingLock = JSON.parse(readFileSync(lockPath, 'utf8'));
} catch {
  /* first run */
}

for (const entry of entries) {
  const existing = existingLock.find((e) => e.codigo === entry.codigo);
  if (existing && existing.hash !== entry.hash && existing.version === entry.version) {
    console.error(`ERROR: Hash changed for ${entry.codigo} without version bump!`);
    process.exit(1);
  }
}

writeFileSync(lockPath, JSON.stringify(entries, null, 2));
console.log(`corpus.lock.json: ${entries.length} normas, ${controlCount} controles`);
