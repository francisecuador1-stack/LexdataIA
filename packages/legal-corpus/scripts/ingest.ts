/**
 * Loads corpus YAML into the database (idempotent by codigo + version).
 *
 * Usage:
 *   pnpm --filter legal-corpus hash        # generate corpus.lock.json first
 *   npx tsx packages/legal-corpus/scripts/ingest.ts
 */
import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';
import { readFileSync, readdirSync } from 'fs';
import { parse } from 'yaml';
import { join } from 'path';

const prisma = new PrismaClient();

function sha256(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

/** Must match packages/legal-corpus/scripts/hash.ts exactly */
function canonicalize(norma: { codigo: string; version: string; titulo: string; texto_normativo: string }): string {
  return JSON.stringify({
    codigo: norma.codigo,
    version: norma.version,
    titulo: norma.titulo,
    texto_normativo: norma.texto_normativo,
  }, null, 0);
}

interface NormaYaml {
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
  controles?: Array<{
    titulo: string;
    descripcion: string;
    evidencia_requerida: string;
    fase_phva: string;
  }>;
}

interface LockEntry {
  codigo: string;
  hash: string;
  version: string;
}

async function main() {
  const corpusBase = join(import.meta.dirname, '..');
  const lockPath = join(corpusBase, 'corpus.lock.json');

  let lockData: LockEntry[];
  try {
    lockData = JSON.parse(readFileSync(lockPath, 'utf8'));
  } catch {
    console.error('ERROR: corpus.lock.json not found. Run `pnpm --filter legal-corpus hash` first.');
    process.exit(1);
  }

  const lockMap = new Map(lockData.map(e => [e.codigo, e]));

  // Read all YAML files from corpus/nacional and corpus/internacional
  const allNormas: NormaYaml[] = [];
  for (const subdir of ['nacional', 'internacional']) {
    const dir = join(corpusBase, 'corpus', subdir);
    let files: string[];
    try { files = readdirSync(dir).filter(f => f.endsWith('.yaml')); } catch { continue; }
    for (const file of files) {
      const content = readFileSync(join(dir, file), 'utf8');
      const normas: NormaYaml[] = parse(content);
      allNormas.push(...normas);
    }
  }

  console.log(`Found ${allNormas.length} normas in YAML files`);

  let upsertedNormas = 0;
  let upsertedControles = 0;

  for (const n of allNormas) {
    const lockEntry = lockMap.get(n.codigo);
    if (!lockEntry) {
      throw new Error(`Norma ${n.codigo} not found in corpus.lock.json. Run 'pnpm --filter legal-corpus hash' first.`);
    }

    // Verify hash matches lock file
    const computedHash = sha256(canonicalize(n));
    if (computedHash !== lockEntry.hash) {
      throw new Error(
        `Hash mismatch for ${n.codigo}: computed=${computedHash}, lock=${lockEntry.hash}. ` +
        `YAML content may have changed without running 'pnpm --filter legal-corpus hash'.`
      );
    }

    // Upsert norma (idempotent by codigo)
    const norma = await prisma.norma.upsert({
      where: { codigo: n.codigo },
      update: {
        fuente: n.fuente as any,
        tipo: n.tipo as any,
        identificador: n.identificador,
        titulo: n.titulo,
        categoria: n.categoria,
        resumenEjecutivo: n.resumen_ejecutivo,
        textoNormativo: n.texto_normativo,
        organismoEmisor: n.organismo_emisor,
        fechaEmision: new Date(n.fecha_emision),
        version: n.version,
        fasePHVA: n.fase_phva as any,
        hashSha256: lockEntry.hash,
        modulosRelacionados: n.modulos_relacionados ?? [],
      },
      create: {
        codigo: n.codigo,
        fuente: n.fuente as any,
        tipo: n.tipo as any,
        identificador: n.identificador,
        titulo: n.titulo,
        categoria: n.categoria,
        resumenEjecutivo: n.resumen_ejecutivo,
        textoNormativo: n.texto_normativo,
        organismoEmisor: n.organismo_emisor,
        fechaEmision: new Date(n.fecha_emision),
        version: n.version,
        fasePHVA: n.fase_phva as any,
        hashSha256: lockEntry.hash,
        modulosRelacionados: n.modulos_relacionados ?? [],
      },
    });
    upsertedNormas++;

    // Upsert associated controles normativos
    if (n.controles) {
      for (const ctrl of n.controles) {
        const ctrlHash = sha256(`${ctrl.titulo}|${ctrl.evidencia_requerida}`);
        // Use hash as a stable identifier for upsert — find existing by normaId + titulo
        const existing = await prisma.controlNormativo.findFirst({
          where: { normaId: norma.id, titulo: ctrl.titulo },
        });

        if (existing) {
          await prisma.controlNormativo.update({
            where: { id: existing.id },
            data: {
              descripcion: ctrl.descripcion,
              evidenciaRequerida: ctrl.evidencia_requerida,
              fasePHVA: ctrl.fase_phva as any,
              hashSha256: ctrlHash,
            },
          });
        } else {
          await prisma.controlNormativo.create({
            data: {
              normaId: norma.id,
              titulo: ctrl.titulo,
              descripcion: ctrl.descripcion,
              evidenciaRequerida: ctrl.evidencia_requerida,
              fasePHVA: ctrl.fase_phva as any,
              hashSha256: ctrlHash,
            },
          });
        }
        upsertedControles++;
      }
    }
  }

  console.log(`Ingested ${upsertedNormas} normas, ${upsertedControles} controles normativos`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
