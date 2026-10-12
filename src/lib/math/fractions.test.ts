import { describe, expect, it } from 'vitest';
import { areEquivalent, formatFraction, gcd, isSimplified, parseFraction, simplify } from './fractions';

describe('fracciones', () => {
  it('calcula el máximo común divisor', () => {
    expect(gcd(12, 18)).toBe(6);
    expect(gcd(7, 0)).toBe(7);
  });

  it('interpreta fracciones con espacios y enteros', () => {
    expect(parseFraction(' 3 / 4 ')).toEqual([3, 4]);
    expect(parseFraction('2')).toEqual([2, 1]);
  });

  it('rechaza formatos inválidos y denominador cero', () => {
    expect(parseFraction('3-4')).toBeNull();
    expect(parseFraction('1/0')).toBeNull();
    expect(parseFraction('')).toBeNull();
  });

  it('acepta fracciones equivalentes', () => {
    expect(areEquivalent([6, 8], [3, 4])).toBe(true);
    expect(areEquivalent([2, 3], [3, 4])).toBe(false);
  });

  it('simplifica y formatea', () => {
    expect(simplify([6, 8])).toEqual([3, 4]);
    expect(isSimplified([6, 8])).toBe(false);
    expect(formatFraction([4, 1])).toBe('4');
  });
});
