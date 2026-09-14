import { chunkar, type ChunkInput } from '../chunker';

const baseInput: ChunkInput = {
  normaId: 'test-norma-id',
  codigo: 'LOPDP-ART-7',
  identificador: 'Art. 7',
  fuente: 'LOPDP',
  tipo: 'NACIONAL',
  fasePHVA: 'PLANIFICAR',
  organismoEmisor: 'Asamblea Nacional',
  version: '1.0',
  titulo: 'Consentimiento del titular',
  textoNormativo: '',
};

describe('chunkar', () => {
  it('produces single chunk for short article', () => {
    const input = { ...baseInput, textoNormativo: 'El consentimiento debe ser libre e informado.' };
    const chunks = chunkar(input);

    expect(chunks).toHaveLength(1);
    expect(chunks[0]!.orden).toBe(0);
    expect(chunks[0]!.contenido).toContain('LOPDP > Art. 7');
    expect(chunks[0]!.contenido).toContain('Consentimiento del titular');
    expect(chunks[0]!.contenido).toContain('El consentimiento debe ser libre');
    expect(chunks[0]!.hashSha256).toHaveLength(64);
  });

  it('produces multiple chunks for long article with overlap', () => {
    // Create a text longer than ~4000 chars (1000 tokens * 4 chars/token)
    const paragraph = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ';
    const longText = Array(100).fill(paragraph).join('\n\n');
    const input = { ...baseInput, textoNormativo: longText };

    const chunks = chunkar(input);

    expect(chunks.length).toBeGreaterThan(1);
    // Each chunk should have the header prepended
    for (const chunk of chunks) {
      expect(chunk.contenido).toContain('LOPDP > Art. 7');
    }
    // Orders should be sequential
    const orders = chunks.map((c) => c.orden);
    expect(orders).toEqual(orders.map((_, i) => i));
  });

  it('produces idempotent hashes for same content', () => {
    const input = { ...baseInput, textoNormativo: 'Texto de prueba determinista.' };
    const chunks1 = chunkar(input);
    const chunks2 = chunkar(input);

    expect(chunks1[0]!.hashSha256).toBe(chunks2[0]!.hashSha256);
  });

  it('includes metadata with all required fields', () => {
    const input = { ...baseInput, textoNormativo: 'Texto normativo.' };
    const chunks = chunkar(input);

    const meta = chunks[0]!.metadata;
    expect(meta).toHaveProperty('codigo', 'LOPDP-ART-7');
    expect(meta).toHaveProperty('identificador', 'Art. 7');
    expect(meta).toHaveProperty('fuente', 'LOPDP');
    expect(meta).toHaveProperty('tipo', 'NACIONAL');
    expect(meta).toHaveProperty('fasePHVA', 'PLANIFICAR');
    expect(meta).toHaveProperty('organismoEmisor', 'Asamblea Nacional');
    expect(meta).toHaveProperty('version', '1.0');
    expect(meta).toHaveProperty('orden', 0);
  });
});
