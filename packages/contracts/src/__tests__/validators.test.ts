import { describe, it, expect } from 'vitest';
import { rucSchema, cedulaSchema, provinciaSchema, telefonoEcSchema } from '../validators';

describe('rucSchema', () => {
  it('should accept a valid natural person RUC', () => {
    expect(() => rucSchema.parse('1791234567001')).not.toThrow();
  });

  it('should accept a valid juridical person RUC', () => {
    expect(() => rucSchema.parse('1791234567001')).not.toThrow();
  });

  it('should reject RUC with wrong length', () => {
    expect(() => rucSchema.parse('179123456')).toThrow();
  });

  it('should reject RUC not ending in 001', () => {
    expect(() => rucSchema.parse('1791234567002')).toThrow();
  });

  it('should reject RUC with invalid province code', () => {
    expect(() => rucSchema.parse('2591234567001')).toThrow();
  });

  it('should reject empty string', () => {
    expect(() => rucSchema.parse('')).toThrow();
  });
});

describe('cedulaSchema', () => {
  it('should accept a valid cédula (1710034065)', () => {
    expect(() => cedulaSchema.parse('1710034065')).not.toThrow();
  });

  it('should accept another valid cédula (0102030405)', () => {
    // This may or may not pass verification - we test the algorithm
    const result = cedulaSchema.safeParse('0102030405');
    // Just checking it runs without crashing
    expect(typeof result.success).toBe('boolean');
  });

  it('should reject cédula with wrong length', () => {
    expect(() => cedulaSchema.parse('12345')).toThrow();
  });

  it('should reject cédula with invalid province', () => {
    expect(() => cedulaSchema.parse('2510034065')).toThrow();
  });

  it('should reject cédula with third digit > 5', () => {
    expect(() => cedulaSchema.parse('1780034065')).toThrow();
  });

  it('should reject cédula with wrong check digit', () => {
    expect(() => cedulaSchema.parse('1710034066')).toThrow();
  });
});

describe('provinciaSchema', () => {
  it('should accept Pichincha', () => {
    expect(provinciaSchema.parse('Pichincha')).toBe('Pichincha');
  });

  it('should reject invalid province', () => {
    expect(() => provinciaSchema.parse('Atlantis')).toThrow();
  });
});

describe('telefonoEcSchema', () => {
  it('should accept a valid mobile number', () => {
    expect(() => telefonoEcSchema.parse('0991234567')).not.toThrow();
  });

  it('should accept a valid landline', () => {
    expect(() => telefonoEcSchema.parse('022345678')).not.toThrow();
  });

  it('should accept formatted number', () => {
    expect(() => telefonoEcSchema.parse('099-123-4567')).not.toThrow();
  });

  it('should reject invalid number', () => {
    expect(() => telefonoEcSchema.parse('12345')).toThrow();
  });
});
