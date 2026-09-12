import { describe, it, expect } from 'vitest';
import { decidirEipd, EipdInput } from '../eipd.js';

const EMPTY: EipdInput = {
  granEscala: false,
  datosSensibles: false,
  decisionesAutomatizadas: false,
  perfilamiento: false,
  menores: false,
};

describe('decidirEipd', () => {
  it('none -> NO_OBLIGATORIO', () => {
    const result = decidirEipd(EMPTY);
    expect(result.decision).toBe('NO_OBLIGATORIO');
    expect(result.cumplidos).toBe(0);
  });

  it('only granEscala -> NO_OBLIGATORIO', () => {
    const result = decidirEipd({ ...EMPTY, granEscala: true });
    expect(result.decision).toBe('NO_OBLIGATORIO');
    expect(result.cumplidos).toBe(1);
  });

  it('only datosSensibles -> OBLIGATORIO', () => {
    const result = decidirEipd({ ...EMPTY, datosSensibles: true });
    expect(result.decision).toBe('OBLIGATORIO');
    expect(result.cumplidos).toBe(1);
  });

  it('only menores -> OBLIGATORIO', () => {
    const result = decidirEipd({ ...EMPTY, menores: true });
    expect(result.decision).toBe('OBLIGATORIO');
    expect(result.cumplidos).toBe(1);
  });

  it('2+ criteria -> OBLIGATORIO', () => {
    const result = decidirEipd({ ...EMPTY, granEscala: true, perfilamiento: true });
    expect(result.decision).toBe('OBLIGATORIO');
    expect(result.cumplidos).toBe(2);
  });

  it('all criteria -> OBLIGATORIO with 5 cumplidos', () => {
    const result = decidirEipd({
      granEscala: true,
      datosSensibles: true,
      decisionesAutomatizadas: true,
      perfilamiento: true,
      menores: true,
    });
    expect(result.decision).toBe('OBLIGATORIO');
    expect(result.cumplidos).toBe(5);
    expect(result.puntajeMtge).toBe(5);
  });

  it('only decisionesAutomatizadas -> NO_OBLIGATORIO (1 criterion, not sensibles/menores)', () => {
    const result = decidirEipd({ ...EMPTY, decisionesAutomatizadas: true });
    expect(result.decision).toBe('NO_OBLIGATORIO');
  });
});
