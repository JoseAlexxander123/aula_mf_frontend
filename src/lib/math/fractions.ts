// Utilidades puras de fracciones (compartidas por la práctica y las evaluaciones del modo mock).

export type Fraction = readonly [numerator: number, denominator: number];

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x;
}

/** Acepta «3/4», « 3 / 4 » o enteros («2» → 2/1). Devuelve null si no es válida. */
export function parseFraction(input: string): Fraction | null {
  const clean = input.replace(/\s+/g, '');
  const match = clean.match(/^(-?\d{1,6})(?:\/(\d{1,6}))?$/);
  if (!match) return null;
  const numerator = Number(match[1]);
  const denominator = match[2] === undefined ? 1 : Number(match[2]);
  if (denominator === 0) return null;
  return [numerator, denominator];
}

export function areEquivalent([an, ad]: Fraction, [bn, bd]: Fraction): boolean {
  return an * bd === bn * ad;
}

export function simplify([n, d]: Fraction): Fraction {
  const g = gcd(n, d) || 1;
  return [n / g, d / g];
}

export function isSimplified(f: Fraction): boolean {
  return gcd(f[0], f[1]) === 1;
}

export const formatFraction = ([n, d]: Fraction) => (d === 1 ? String(n) : `${n}/${d}`);
