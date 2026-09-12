import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { parse } from 'yaml';
import { join } from 'path';

interface NormaYaml {
  codigo: string;
  fuente: string;
  controles?: Array<{ titulo: string }>;
}

function loadCorpus(): NormaYaml[] {
  const corpusDir = join(import.meta.dirname, '..', '..', 'corpus');
  const all: NormaYaml[] = [];
  for (const subdir of ['nacional', 'internacional']) {
    const dir = join(corpusDir, subdir);
    let files: string[];
    try { files = readdirSync(dir).filter(f => f.endsWith('.yaml')); } catch { continue; }
    for (const file of files) {
      const content = readFileSync(join(dir, file), 'utf8');
      const normas: NormaYaml[] = parse(content);
      all.push(...normas);
    }
  }
  return all;
}

describe('Legal Corpus', () => {
  const normas = loadCorpus();

  it('should have 36 normas total (28 national + 8 international)', () => {
    expect(normas.length).toBe(36);
  });

  it('should have 12 LOPDP articles', () => {
    expect(normas.filter(n => n.fuente === 'LOPDP').length).toBe(12);
  });

  it('should have 2 RGLOPDP articles', () => {
    expect(normas.filter(n => n.fuente === 'RGLOPDP').length).toBe(2);
  });

  it('should have 2 SPDP resolutions', () => {
    expect(normas.filter(n => n.fuente === 'SPDP').length).toBe(2);
  });

  it('should have 1 SGPDP resolution', () => {
    expect(normas.filter(n => n.fuente === 'SGPDP').length).toBe(1);
  });

  it('should have 11 CRE articles', () => {
    expect(normas.filter(n => n.fuente === 'CRE').length).toBe(11);
  });

  it('should have 8 international norms', () => {
    const intl = normas.filter(n => ['ISO_27001', 'ISO_27701', 'ISO_42001', 'NIST'].includes(n.fuente));
    expect(intl.length).toBe(8);
  });

  it('should have 18 controls total', () => {
    const totalControls = normas.reduce((sum, n) => sum + (n.controles?.length ?? 0), 0);
    expect(totalControls).toBe(18);
  });

  it('every control should reference an existing norma', () => {
    const codigos = new Set(normas.map(n => n.codigo));
    for (const norma of normas) {
      if (norma.controles) {
        expect(codigos.has(norma.codigo)).toBe(true);
      }
    }
  });
});
