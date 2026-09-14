/**
 * Embeddings provider interface and Voyage AI implementation.
 *
 * §7.2: Desacoplada vía interfaz. Implementación con voyage-law-2
 * (1024 dimensiones, entrenado sobre corpus legal).
 *
 * Uses input_type asymmetry: "document" for indexing, "query" for search.
 */

export interface EmbeddingsProvider {
  readonly modelo: string;
  readonly dimensiones: number;
  embedDocumentos(textos: string[]): Promise<number[][]>;
  embedConsulta(texto: string): Promise<number[]>;
}

/**
 * Voyage AI provider using voyage-law-2.
 *
 * Requires VOYAGE_API_KEY environment variable.
 * Falls back gracefully — if key is missing, isAvailable() returns false
 * and the search degrades to lexical-only.
 */
export class VoyageEmbeddingsProvider implements EmbeddingsProvider {
  readonly modelo: string;
  readonly dimensiones: number;
  private readonly apiKey: string | undefined;
  private readonly batchSize: number;

  constructor() {
    this.modelo = process.env['EMBEDDINGS_MODEL'] ?? 'voyage-law-2';
    this.dimensiones = parseInt(process.env['EMBEDDINGS_DIM'] ?? '1024', 10);
    this.apiKey = process.env['VOYAGE_API_KEY'];
    this.batchSize = parseInt(process.env['EMBEDDINGS_BATCH_SIZE'] ?? '128', 10);
  }

  isAvailable(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }

  async embedDocumentos(textos: string[]): Promise<number[][]> {
    if (!this.isAvailable()) {
      throw new Error('VOYAGE_API_KEY not configured — embeddings unavailable');
    }

    const results: number[][] = [];

    // Process in batches (§7.2: lotes de 128)
    for (let i = 0; i < textos.length; i += this.batchSize) {
      const batch = textos.slice(i, i + this.batchSize);
      const embeddings = await this.callVoyageAPI(batch, 'document');
      results.push(...embeddings);
    }

    return results;
  }

  async embedConsulta(texto: string): Promise<number[]> {
    if (!this.isAvailable()) {
      throw new Error('VOYAGE_API_KEY not configured — embeddings unavailable');
    }

    const [embedding] = await this.callVoyageAPI([texto], 'query');
    if (!embedding) throw new Error('No embedding returned from Voyage API');
    return embedding;
  }

  private async callVoyageAPI(
    texts: string[],
    inputType: 'document' | 'query',
  ): Promise<number[][]> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch('https://api.voyageai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: this.modelo,
            input: texts,
            input_type: inputType,
          }),
          signal: AbortSignal.timeout(30_000),
        });

        if (response.status === 429) {
          // Rate limited — exponential backoff
          const waitMs = Math.pow(2, attempt) * 1000;
          await new Promise((r) => setTimeout(r, waitMs));
          continue;
        }

        if (!response.ok) {
          const body = await response.text();
          throw new Error(`Voyage API error ${response.status}: ${body}`);
        }

        const data = (await response.json()) as {
          data: Array<{ embedding: number[] }>;
        };

        // Verify dimensions match
        const firstEmbedding = data.data[0]?.embedding;
        if (firstEmbedding && firstEmbedding.length !== this.dimensiones) {
          throw new Error(
            `Dimension mismatch: expected ${this.dimensiones}, got ${firstEmbedding.length}. ` +
            `Check EMBEDDINGS_DIM matches the model's actual output.`,
          );
        }

        return data.data.map((d) => d.embedding);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < maxRetries - 1) {
          const waitMs = Math.pow(2, attempt) * 1000;
          await new Promise((r) => setTimeout(r, waitMs));
        }
      }
    }

    throw lastError ?? new Error('Voyage API call failed');
  }
}
