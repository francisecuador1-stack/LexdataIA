import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VoyageEmbeddingsProvider, type EmbeddingsProvider } from './embeddings-provider';
import { chunkar, type ChunkInput } from './chunker';

/**
 * §7.4: Hybrid search with RRF (Reciprocal Rank Fusion).
 *
 * 1. Semantic: top 30 by cosine distance (only textoVerificado = true)
 * 2. Lexical: top 30 by ts_rank_cd (Spanish tsvector, only textoVerificado = true)
 * 3. RRF fusion: score = Σ 1/(60 + rank_i), deduplicated by norma
 *
 * Degradation: if embeddings unavailable, falls back to lexical-only
 * and returns modo: "lexica" (§7.4 — honest degradation).
 */

interface SearchResult {
  norma: {
    id: string;
    codigo: string;
    identificador: string;
    titulo: string;
    fuente: string;
    tipo: string;
    fasePHVA: string;
  };
  chunk: {
    id: string;
    encabezado: string | null;
    extracto: string;
  } | null;
  score: number;
  scoreSemantico: number | null;
  scoreLexico: number;
  resaltados: string[];
}

interface SearchResponse {
  modo: 'hibrida' | 'semantica' | 'lexica';
  total: number;
  data: SearchResult[];
}

@Injectable()
export class HybridSearchService {
  private readonly embeddings: EmbeddingsProvider;

  constructor(private readonly prisma: PrismaService) {
    this.embeddings = new VoyageEmbeddingsProvider();
  }

  /**
   * Hybrid search: semantic + lexical + RRF fusion.
   */
  async buscar(
    q: string,
    opts: { modo?: 'hibrida' | 'semantica' | 'lexica'; limit?: number } = {},
  ): Promise<SearchResponse> {
    const limit = Math.min(opts.limit ?? 10, 50);
    const requestedMode = opts.modo ?? 'hibrida';

    const embeddingsAvailable =
      (this.embeddings as VoyageEmbeddingsProvider).isAvailable?.() ?? false;

    // Determine actual mode — degrade honestly
    let actualMode: 'hibrida' | 'semantica' | 'lexica' = requestedMode;
    if (requestedMode !== 'lexica' && !embeddingsAvailable) {
      actualMode = 'lexica';
    }

    let semanticResults: Array<{ chunkId: string; normaId: string; score: number }> = [];
    let lexicalResults: Array<{ normaId: string; score: number; headline: string }> = [];
    let semanticFailed = false;

    const promises: Promise<void>[] = [];

    if (actualMode !== 'lexica') {
      promises.push(
        this.searchSemantic(q, 30).then((r) => { semanticResults = r; }).catch((err) => {
          console.error('[HybridSearch] Semantic search failed:', err);
          semanticFailed = true;
        }),
      );
    }

    promises.push(
      this.searchLexical(q, 30).then((r) => { lexicalResults = r; }),
    );

    await Promise.all(promises);

    // If semantic failed, downgrade to lexical
    if (semanticFailed && actualMode !== 'lexica') {
      actualMode = 'lexica';
    }

    // RRF fusion — deduplicate semantic by norma first
    const dedupedSemantic = this.deduplicateByNorma(semanticResults);
    const fused = this.rrfFuse(dedupedSemantic, lexicalResults, limit);

    // Fetch full norma data
    const normaIds = [...new Set(fused.map((f) => f.normaId))];
    const normas = normaIds.length > 0
      ? await this.prisma.norma.findMany({
          where: { id: { in: normaIds } },
          select: { id: true, codigo: true, identificador: true, titulo: true, fuente: true, tipo: true, fasePHVA: true },
        })
      : [];
    const normaMap = new Map(normas.map((n) => [n.id, n]));

    // Fetch chunk data
    const chunkIds = fused.map((f) => f.chunkId).filter(Boolean) as string[];
    const chunks = chunkIds.length > 0
      ? await this.prisma.corpusChunk.findMany({
          where: { id: { in: chunkIds } },
          select: { id: true, encabezado: true, contenido: true },
        })
      : [];
    const chunkMap = new Map(chunks.map((c) => [c.id, c]));

    const data: SearchResult[] = fused.map((f) => {
      const norma = normaMap.get(f.normaId);
      const chunk = f.chunkId ? chunkMap.get(f.chunkId) : null;
      return {
        norma: norma ?? { id: f.normaId, codigo: '', identificador: '', titulo: '', fuente: '', tipo: '', fasePHVA: '' },
        chunk: chunk ? { id: chunk.id, encabezado: chunk.encabezado, extracto: chunk.contenido.slice(0, 300) } : null,
        score: f.score,
        scoreSemantico: f.scoreSemantico,
        scoreLexico: f.scoreLexico,
        resaltados: f.headline ? extractHighlights(f.headline) : [],
      };
    });

    return { modo: actualMode, total: data.length, data };
  }

  /**
   * Index normas: chunk + embed + store.
   * Runs outside the request transaction to avoid timeout.
   * indexadoAt is ONLY set when embedding is persisted successfully.
   */
  async indexar(normaIds?: string[], forzar = false): Promise<{ jobId: string }> {
    // Create a job record and return immediately
    // The actual indexing runs after the response
    const job = await this.prisma.jobIngesta.create({
      data: {
        tipo: 'indexacion',
        estado: 'PENDIENTE',
        iniciadoPorId: '00000000-0000-0000-0000-000000000000', // System
      },
    });

    // Run indexing asynchronously (outside request transaction)
    this.runIndexation(job.id, normaIds, forzar).catch((err) => {
      console.error('[Indexation] Fatal error:', err);
    });

    return { jobId: job.id };
  }

  private async runIndexation(jobId: string, normaIds?: string[], forzar = false) {
    await this.prisma.jobIngesta.update({
      where: { id: jobId },
      data: { estado: 'EJECUTANDO', startedAt: new Date() },
    });

    try {
      const where: any = { textoVerificado: true };
      if (normaIds?.length) where.id = { in: normaIds };
      if (!forzar) where.indexadoAt = null;

      const normas = await this.prisma.norma.findMany({
        where,
        select: {
          id: true, codigo: true, identificador: true, fuente: true, tipo: true,
          fasePHVA: true, organismoEmisor: true, version: true, textoNormativo: true, titulo: true,
        },
      });

      let totalChunks = 0;
      let itemsOk = 0;
      let itemsError = 0;

      for (const norma of normas) {
        try {
          const chunkInput: ChunkInput = {
            normaId: norma.id, codigo: norma.codigo, identificador: norma.identificador,
            fuente: norma.fuente, tipo: norma.tipo, fasePHVA: norma.fasePHVA,
            organismoEmisor: norma.organismoEmisor, version: norma.version,
            textoNormativo: norma.textoNormativo, titulo: norma.titulo,
          };
          const chunks = chunkar(chunkInput);

          // Check idempotency: compare hashes of existing chunks
          const existingChunks = await this.prisma.corpusChunk.findMany({
            where: { normaId: norma.id },
            select: { hashSha256: true },
            orderBy: { orden: 'asc' },
          });
          const existingHashes = new Set(existingChunks.map((c) => c.hashSha256));
          const newHashes = new Set(chunks.map((c) => c.hashSha256));
          const hashesMatch = existingHashes.size === newHashes.size &&
            [...existingHashes].every((h) => newHashes.has(h));

          if (hashesMatch && !forzar) {
            // Chunks unchanged — skip re-embedding
            itemsOk++;
            totalChunks += chunks.length;
            continue;
          }

          // Delete + recreate chunks in a transaction
          await this.prisma.$transaction(async (tx) => {
            await tx.corpusChunk.deleteMany({ where: { normaId: norma.id } });
            for (const chunk of chunks) {
              await tx.corpusChunk.create({
                data: {
                  normaId: norma.id, contenido: chunk.contenido, encabezado: chunk.encabezado,
                  orden: chunk.orden, tokens: chunk.tokens, hashSha256: chunk.hashSha256,
                  metadata: chunk.metadata as any,
                },
              });
            }
          });

          // Try to embed
          const isAvailable = (this.embeddings as VoyageEmbeddingsProvider).isAvailable?.() ?? false;
          if (isAvailable) {
            const textos = chunks.map((c) => c.contenido);
            const embeddings = await this.embeddings.embedDocumentos(textos);

            const storedChunks = await this.prisma.corpusChunk.findMany({
              where: { normaId: norma.id },
              orderBy: { orden: 'asc' },
              select: { id: true },
            });

            for (let i = 0; i < storedChunks.length && i < embeddings.length; i++) {
              const vec = embeddings[i]!;
              const chunkId = storedChunks[i]!.id;
              // Write embedding directly (outside tenant transaction)
              await this.prisma.$executeRaw`
                UPDATE corpus_chunks
                   SET embedding = ${`[${vec.join(',')}]`}::vector,
                       modelo_embedding = ${this.embeddings.modelo},
                       dimensiones = ${this.embeddings.dimensiones},
                       indexado_at = NOW()
                 WHERE id = ${chunkId}::uuid`;
            }

            // Only mark norma as indexed if embeddings were actually persisted
            await this.prisma.norma.update({
              where: { id: norma.id },
              data: { indexadoAt: new Date(), modeloEmbedding: this.embeddings.modelo },
            });
          }
          // If embeddings not available, do NOT set indexadoAt

          itemsOk++;
          totalChunks += chunks.length;
        } catch (err) {
          console.error(`[Indexation] Failed for ${norma.codigo}:`, err);
          itemsError++;
        }

        // Update progress
        await this.prisma.jobIngesta.update({
          where: { id: jobId },
          data: { progreso: Math.round(((itemsOk + itemsError) / normas.length) * 100), itemsOk, itemsError },
        });
      }

      await this.prisma.jobIngesta.update({
        where: { id: jobId },
        data: {
          estado: itemsError > 0 && itemsOk === 0 ? 'FALLIDO' : 'COMPLETADO',
          progreso: 100, totalItems: normas.length, itemsOk, itemsError,
          finishedAt: new Date(),
        },
      });
    } catch (err) {
      await this.prisma.jobIngesta.update({
        where: { id: jobId },
        data: {
          estado: 'FALLIDO',
          errorMensaje: err instanceof Error ? err.message : String(err),
          finishedAt: new Date(),
        },
      });
    }
  }

  // ─── Private search methods ──────────────────────────────

  private async searchSemantic(
    q: string,
    limit: number,
  ): Promise<Array<{ chunkId: string; normaId: string; score: number }>> {
    const queryVec = await this.embeddings.embedConsulta(q);
    const vecStr = `[${queryVec.join(',')}]`;

    const results = await this.prisma.$queryRaw<
      Array<{ id: string; norma_id: string; distance: number }>
    >`
      SELECT c.id, c.norma_id, c.embedding <=> ${vecStr}::vector AS distance
      FROM corpus_chunks c
      JOIN normas n ON n.id = c.norma_id
      WHERE c.embedding IS NOT NULL
        AND n.texto_verificado = true
      ORDER BY distance ASC
      LIMIT ${limit}
    `;

    return results.map((r) => ({
      chunkId: r.id,
      normaId: r.norma_id,
      score: 1 - r.distance,
    }));
  }

  private async searchLexical(
    q: string,
    limit: number,
  ): Promise<Array<{ normaId: string; score: number; headline: string }>> {
    const results = await this.prisma.$queryRaw<
      Array<{ id: string; score: number; headline: string }>
    >`
      SELECT
        n.id,
        ts_rank_cd(n.busqueda_tsv, plainto_tsquery('spanish', ${q})) AS score,
        ts_headline('spanish', n.titulo || ' ' || n.resumen_ejecutivo,
          plainto_tsquery('spanish', ${q}),
          'MaxWords=30, MinWords=10, StartSel=<mark>, StopSel=</mark>'
        ) AS headline
      FROM normas n
      WHERE n.busqueda_tsv @@ plainto_tsquery('spanish', ${q})
        AND n.texto_verificado = true
      ORDER BY score DESC
      LIMIT ${limit}
    `;

    return results.map((r) => ({
      normaId: r.id,
      score: Number(r.score),
      headline: r.headline,
    }));
  }

  /**
   * Deduplicate semantic results by norma, keeping the best chunk per norma.
   * Fixes C.8: a norma with 6 chunks shouldn't get 6 RRF contributions.
   */
  private deduplicateByNorma(
    results: Array<{ chunkId: string; normaId: string; score: number }>,
  ): Array<{ chunkId: string; normaId: string; score: number }> {
    const best = new Map<string, { chunkId: string; normaId: string; score: number }>();
    for (const r of results) {
      const existing = best.get(r.normaId);
      if (!existing || r.score > existing.score) {
        best.set(r.normaId, r);
      }
    }
    // Return in original score order
    return [...best.values()].sort((a, b) => b.score - a.score);
  }

  /**
   * §7.4: RRF fusion.
   * score = Σ 1/(60 + rank_i)
   */
  private rrfFuse(
    semantic: Array<{ chunkId: string; normaId: string; score: number }>,
    lexical: Array<{ normaId: string; score: number; headline: string }>,
    limit: number,
  ) {
    const k = 60;
    const scoreMap = new Map<string, {
      normaId: string; chunkId: string | null; score: number;
      scoreSemantico: number | null; scoreLexico: number; headline: string | null;
    }>();

    semantic.forEach((s, rank) => {
      scoreMap.set(s.normaId, {
        normaId: s.normaId, chunkId: s.chunkId, score: 1 / (k + rank),
        scoreSemantico: s.score, scoreLexico: 0, headline: null,
      });
    });

    lexical.forEach((l, rank) => {
      const existing = scoreMap.get(l.normaId);
      const rrfScore = 1 / (k + rank);
      if (existing) {
        existing.score += rrfScore;
        existing.scoreLexico = l.score;
        existing.headline = l.headline;
      } else {
        scoreMap.set(l.normaId, {
          normaId: l.normaId, chunkId: null, score: rrfScore,
          scoreSemantico: null, scoreLexico: l.score, headline: l.headline,
        });
      }
    });

    return [...scoreMap.values()].sort((a, b) => b.score - a.score).slice(0, limit);
  }
}

function extractHighlights(headline: string): string[] {
  const matches = headline.match(/<mark>(.*?)<\/mark>/g) ?? [];
  return [...new Set(matches.map((m) => m.replace(/<\/?mark>/g, '')))];
}
