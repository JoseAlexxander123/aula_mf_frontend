import { describe, expect, it } from 'vitest';
import { createRateLimiter } from './rate-limit';

describe('createRateLimiter', () => {
  it('permite hasta el límite dentro de la ventana y luego bloquea', () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 1000 });
    expect(limiter.consume('a', 0).allowed).toBe(true);
    expect(limiter.consume('a', 100).allowed).toBe(true);
    expect(limiter.consume('a', 200).remaining).toBe(0);
    const blocked = limiter.consume('a', 300);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSec).toBe(1);
  });

  it('libera cupos cuando la ventana se desliza', () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000 });
    limiter.consume('a', 0);
    expect(limiter.consume('a', 500).allowed).toBe(false);
    expect(limiter.consume('a', 1001).allowed).toBe(true);
  });

  it('separa las claves y permite reiniciarlas', () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000 });
    limiter.consume('a', 0);
    expect(limiter.consume('b', 0).allowed).toBe(true);
    limiter.reset('a');
    expect(limiter.consume('a', 1).allowed).toBe(true);
  });

  it('mantiene la memoria acotada', () => {
    const limiter = createRateLimiter({ limit: 5, windowMs: 60_000, maxKeys: 10 });
    for (let i = 0; i < 100; i++) limiter.consume(`ip-${i}`, i);
    // La clave más reciente sigue contando; las antiguas se descartaron.
    expect(limiter.consume('ip-99', 200).remaining).toBe(3);
    expect(limiter.consume('ip-0', 200).remaining).toBe(4);
  });
});
