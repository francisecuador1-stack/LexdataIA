import { Injectable, Optional, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HybridSearchService } from '../corpus-admin/search/hybrid-search.service';

export interface CitaNormativa {
  codigo: string;
  identificador: string;
  titulo: string;
  hash: string;
  fuente: string;
  fasePHVA: string;
}

export interface ChunkResult {
  contenido: string;
  metadata: Record<string, unknown>;
  cita: CitaNormativa;
  score: number;
}

@Injectable()
export class CorpusRetriever {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() @Inject(HybridSearchService) private readonly hybridSearch?: HybridSearchService,
  ) {}

  /**
   * buscar_normativa — §7.5: herramienta expuesta a MARK AI.
   * Uses hybrid search (semantic + lexical + RRF) when available.
   */
  async buscar(query: string, filtros?: {
    fuente?: string;
    tipo?: string;
    fasePHVA?: string;
  }, topK: number = 8): Promise<ChunkResult[]> {
    // Use hybrid search when available (§7.5)
    if (this.hybridSearch) {
      try {
        const result = await this.hybridSearch.buscar(query, { limit: topK });
        return result.data.map((r) => ({
          contenido: r.chunk
            ? `${r.chunk.encabezado ?? r.norma.identificador}\n${r.chunk.extracto}`
            : `${r.norma.identificador} — ${r.norma.titulo}`,
          metadata: { normaId: r.norma.id, fuente: r.norma.fuente, tipo: r.norma.tipo },
          cita: {
            codigo: r.norma.codigo,
            identificador: r.norma.identificador,
            titulo: r.norma.titulo,
            hash: '',
            fuente: r.norma.fuente,
            fasePHVA: r.norma.fasePHVA,
          },
          score: r.score,
        }));
      } catch {
        // Fall through to legacy search
      }
    }

    // Fallback: text search across normas
    const normas = await this.prisma.norma.findMany({
      where: {
        AND: [
          filtros?.fuente ? { fuente: filtros.fuente as any } : {},
          filtros?.tipo ? { tipo: filtros.tipo as any } : {},
          filtros?.fasePHVA ? { fasePHVA: filtros.fasePHVA as any } : {},
          {
            OR: [
              { titulo: { contains: query, mode: 'insensitive' as const } },
              { resumenEjecutivo: { contains: query, mode: 'insensitive' as const } },
              { textoNormativo: { contains: query, mode: 'insensitive' as const } },
              { identificador: { contains: query, mode: 'insensitive' as const } },
            ],
          },
        ],
      },
      include: { controlesNormativos: true },
      take: topK * 2,
    });

    // Score and rank results
    const results: ChunkResult[] = normas.map((n, idx) => {
      // Simple scoring: prioritize LOPDP/RGLOPDP for Ecuadorian legal queries
      let score = 1.0 / (idx + 1); // RRF base
      if (['LOPDP', 'RGLOPDP'].includes(n.fuente)) score *= 1.5;
      if (n.titulo.toLowerCase().includes(query.toLowerCase())) score *= 2.0;

      return {
        contenido: `${n.identificador} — ${n.titulo}\n${n.resumenEjecutivo}`,
        metadata: { normaId: n.id, fuente: n.fuente, tipo: n.tipo },
        cita: {
          codigo: n.codigo,
          identificador: n.identificador,
          titulo: n.titulo,
          hash: n.hashSha256,
          fuente: n.fuente,
          fasePHVA: n.fasePHVA,
        },
        score,
      };
    });

    // Sort by score descending and take topK
    return results.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  /** Search specifically for norm suggestion on a finding text */
  async sugerirNorma(texto: string): Promise<Array<{
    norma: CitaNormativa;
    controlNormativo?: { titulo: string; evidenciaRequerida: string };
    score: number;
    justificacion: string;
  }>> {
    const chunks = await this.buscar(texto, undefined, 5);

    return chunks.slice(0, 3).map((c) => ({
      norma: c.cita,
      controlNormativo: undefined, // TODO: match with controles_normativos
      score: c.score,
      justificacion: `Relevancia por coincidencia textual con ${c.cita.identificador}`,
    }));
  }
}
