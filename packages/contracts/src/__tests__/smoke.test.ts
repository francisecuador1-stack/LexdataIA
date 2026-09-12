import { describe, it, expect } from 'vitest';
import { RolSchema } from '../enums';

describe('contracts smoke test', () => {
  it('should validate a valid role', () => {
    expect(RolSchema.parse('DPO_HUMANO')).toBe('DPO_HUMANO');
  });

  it('should reject an invalid role', () => {
    expect(() => RolSchema.parse('INVALID')).toThrow();
  });
});
