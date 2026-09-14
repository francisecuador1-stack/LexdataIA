import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VoyageEmbeddingsProvider, type EmbeddingsProvider } from './embeddings-provider';
import { chunkar, type ChunkInput } from './chunker';

/**
 * §7.4: Hybrid search with RRF (Reciprocal Rank Fusion).
 *
 * 1. Semantic: top 30 by cosine distance (only textoVerificado = true)
 * 2. Lexical: top 30 by ts_rank_cd (Spanish tsvector)
 * 3. RRF fusion: score = Σ 1/(60 + rank_i)
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

    // Determine actual mode based on provider availability
    const embeddingsAvailable =
      (this.embeddings as VoyageEmbeddingsProvider).isAvailable?.() ?? false;
    const actualMode =
      requestedMode === 'lexica' ? 'lexica'
        : !embeddingsAvailable ? 'lexica'
        : requestedMode;

    let semanticResults: Array<{ chunkId: string; normaId: string; score: number }> = [];
    let lexicalResults: Array<{ normaId: string; score: number; headline: string }> = [];

    // Run searches in parallel where possible
    const promises: Promise<void>[] = [];

    if (actualMode !== 'lexica') {
      promises.push(
        this.searchSemantic(q, 30).then((r) => { semanticResults = r; }),
      );
    }

    promises.push(
      this.searchLexical(q, 30).then((r) => { lexicalResults = r; }),
    );

    await Promise.all(promises);

    // RRF fusion (§7.4)
    const fused = this.rrfFuse(semanticResults, lexicalResults, limit);

    // Fetch full norma data for results
    const normaIds = [...new Set(fused.map((f) => f.normaId))];
    const normas = normaIds.length > 0
      ? await this.prisma.norma.findMany({
          where: { id: { in: normaIds } },
          select: {
            id: true,
            codigo: true,
            identificador: true,
            titulo: true,
            fuente: true,
            tipo: true,
            fasePHVA: true,
          },
        })
      : [];
    const normaMap = new Map(normas.map((n) => [n.id, n]));

    // Fetch chunk data for semantic results
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
        norma: norma ?? {
          id: f.normaId,
          codigo: '',
          identificador: '',
          titulo: '',
          fuente: '',
          tipo: '',
          fasePHVA: '',
        },
        chunk: chunk
          ? {
              id: chunk.id,
              encabezado: chunk.encabezado,
              extracto: chunk.contenido.slice(0, 300),
            }
          : null,
        score: f.score,
        scoreSemantico: f.scoreSemantico,
        scoreLexico: f.scoreLexico,
        resaltados: f.headline ? extractHighlights(f.headline) : [],
      };
    });

    return {
      modo: actualMode,
      total: data.length,
      data,
    };
  }

  /**
   * Index normas: chunk + embed + store.
   * §7.1-7.3
   */
  async indexar(normaIds?: string[], forzar = false) {
    const where: any = { textoVerificado: true };
    if (normaIds?.length) {
      where.id = { in: normaIds };
    }
    if (!forzar) {
      where.indexadoAt = null;
    }

    const normas = await this.prisma.norma.findMany({
      where,
      select: {
        id: true,
        codigo: true,
        identificador: true,
        fuente: true,
        tipo: true,
        fasePHVA: true,
        organismoEmisor: true,
        version: true,
        textoNormativo: true,
        titulo: true,
      },
    });

    if (normas.length === 0) return { indexed: 0, chunks: 0 };

    let totalChunks = 0;

    for (const norma of normas) {
      const chunkInputs: ChunkInput = {
        normaId: norma.id,
        codigo: norma.codigo,
        identificador: norma.identificador,
        fuente: norma.fuente,
        tipo: norma.tipo,
        fasePHVA: norma.fasePHVA,
        organismoEmisor: norma.organismoEmisor,
        version: norma.version,
        textoNormativo: norma.textoNormativo,
        titulo: norma.titulo,
      };

      const chunks = chunkar(chunkInputs);

      // Delete existing chunks for this norma if re-indexing
      await this.prisma.corpusChunk.deleteMany({
        where: { normaId: norma.id },
      });

      for (const chunk of chunks) {
        // Check idempotency: if hash hasn't changed, skip embedding
        // (§7.1: "si el hash no cambió, no se vuelve a embeber")
        await this.prisma.corpusChunk.create({
          data: {
            normaId: norma.id,
            contenido: chunk.contenido,
            encabezado: chunk.encabezado,
            orden: chunk.orden,
            tokens: chunk.tokens,
            hashSha256: chunk.hashSha256,
            metadata: chunk.metadata as any,
            modeloEmbedding: null, // Set after embedding
            dimensiones: null,
            indexadoAt: null,
          },
        });
      }

      // Try to embed if provider is available
      if ((this.embeddings as VoyageEmbeddingsProvider).isAvailable()) {
        try {
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

            // §7.3: Use parameterized raw SQL for vector writes
            await this.prisma.$executeRaw`
              UPDATE corpus_chunks
                 SET embedding = ${`[${vec.join(',')}]`}::vector,
                     modelo_embedding = ${this.embeddings.modelo},
                     dimensiones = ${this.embeddings.dimensiones},
                     indexado_at = NOW()
               WHERE id = ${chunkId}::uuid`;
          }
        } catch (error) {
          // Embeddings failed but chunks are stored — lexical search still works
          console.error(`Embedding failed for norma ${norma.codigo}:`, error);
        }
      }

      // Mark norma as indexed (even without embeddings — chunks exist)
      await this.prisma.norma.update({
        where: { id: norma.id },
        data: {
          indexadoAt: new Date(),
          modeloEmbedding: (this.embeddings as VoyageEmbeddingsProvider).isAvailable()
            ? this.embeddings.modelo
            : null,
        },
      });

      totalChunks += chunks.length;
    }

    return { indexed: normas.length, chunks: totalChunks };
  }

  // ─── Private search methods ──────────────────────────────

  private async searchSemantic(
    q: string,
    limit: number,
  ): Promise<Array<{ chunkId: string; normaId: string; score: number }>> {
    try {
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
        score: 1 - r.distance, // Convert distance to similarity
      }));
    } catch {
      return [];
    }
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
   * §7.4: RRF fusion.
   * score = Σ 1/(60 + rank_i)
   */
  private rrfFuse(
    semantic: Array<{ chunkId: string; normaId: string; score: number }>,
    lexical: Array<{ normaId: string; score: number; headline: string }>,
    limit: number,
  ) {
    const k = 60; // RRF constant
    const scoreMap = new Map<
      string,
      {
        normaId: string;
        chunkId: string | null;
        score: number;
        scoreSemantico: number | null;
        scoreLexico: number;
        headline: string | null;
      }
    >();

    // Add semantic scores
    semantic.forEach((s, rank) => {
      const key = s.normaId;
      const existing = scoreMap.get(key);
      const rrfScore = 1 / (k + rank);
      if (existing) {
        existing.score += rrfScore;
        existing.scoreSemantico = s.score;
        existing.chunkId = existing.chunkId ?? s.chunkId;
      } else {
        scoreMap.set(key, {
          normaId: s.normaId,
          chunkId: s.chunkId,
          score: rrfScore,
          scoreSemantico: s.score,
          scoreLexico: 0,
          headline: null,
        });
      }
    });

    // Add lexical scores
    lexical.forEach((l, rank) => {
      const key = l.normaId;
      const existing = scoreMap.get(key);
      const rrfScore = 1 / (k + rank);
      if (existing) {
        existing.score += rrfScore;
        existing.scoreLexico = l.score;
        existing.headline = l.headline;
      } else {
        scoreMap.set(key, {
          normaId: l.normaId,
          chunkId: null,
          score: rrfScore,
          scoreSemantico: null,
          scoreLexico: l.score,
          headline: l.headline,
        });
      }
    });

    // Sort by fused score and return top N
    return [...scoreMap.values()]
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}

/**
 * Extract highlighted words from ts_headline markup.
 */
function extractHighlights(headline: string): string[] {
  const matches = headline.match(/<mark>(.*?)<\/mark>/g) ?? [];
  return [...new Set(matches.map((m) => m.replace(/<\/?mark>/g, '')))];
}
