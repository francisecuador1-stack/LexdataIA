/**
 * Loads corpus YAML into the database (idempotent by codigo + version).
 *
 * Usage:
 *   pnpm --filter legal-corpus hash        # generate corpus.lock.json first
 *   npx tsx packages/legal-corpus/scripts/ingest.ts
 */
import { PrismaClient } from '@prisma/client';
import { join } from 'path';
import { sha256, loadAndVerifyCorpus } from '../src/index.js';

const prisma = new PrismaClient();

async function main() {
  const corpusBase = join(import.meta.dirname, '..');
  const { normas, lockMap } = loadAndVerifyCorpus(corpusBase);

  console.log(`Found ${normas.length} normas in YAML files`);

  let upsertedNormas = 0;
  let upsertedControles = 0;

  for (const n of normas) {
    const lockEntry = lockMap.get(n.codigo)!;

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

    if (n.controles) {
      for (const ctrl of n.controles) {
        const ctrlHash = sha256(`${ctrl.titulo}|${ctrl.evidencia_requerida}`);
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
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
