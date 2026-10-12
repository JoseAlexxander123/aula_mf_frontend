// Limitador de frecuencia en memoria (ventana deslizante) para un solo proceso.
//
// Se usa en las Server Actions (ingreso, tutor, mensajes) para frenar abusos antes de llegar
// a la API .NET. La memoria está acotada (maxKeys) y las entradas vencidas se limpian de forma
// perezosa, sin temporizadores en segundo plano que consuman CPU.
//
// Si el frontend corre en varias instancias, cambiar el almacenamiento por Redis
// manteniendo la misma interfaz `RateLimiter`.

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Segundos hasta que se libere un cupo (0 si está permitido). */
  retryAfterSec: number;
}

export interface RateLimiter {
  consume(key: string, now?: number): RateLimitResult;
  reset(key: string): void;
}

interface Options {
  limit: number;
  windowMs: number;
  maxKeys?: number;
}

export function createRateLimiter({ limit, windowMs, maxKeys = 10_000 }: Options): RateLimiter {
  const hits = new Map<string, number[]>();

  const prune = (now: number) => {
    for (const [key, times] of hits) {
      if (times[times.length - 1] <= now - windowMs) hits.delete(key);
    }
    // Si aún se supera el tope, se descartan las claves más antiguas (orden de inserción del Map).
    while (hits.size > maxKeys) {
      const oldest = hits.keys().next().value;
      if (oldest === undefined) break;
      hits.delete(oldest);
    }
  };

  return {
    consume(key, now = Date.now()) {
      const since = now - windowMs;
      const times = (hits.get(key) ?? []).filter((t) => t > since);

      if (times.length >= limit) {
        hits.set(key, times);
        return { allowed: false, remaining: 0, retryAfterSec: Math.max(1, Math.ceil((times[0] + windowMs - now) / 1000)) };
      }

      times.push(now);
      hits.delete(key); // reinsertar para mantener el orden «más reciente al final»
      hits.set(key, times);
      if (hits.size > maxKeys) prune(now);
      return { allowed: true, remaining: limit - times.length, retryAfterSec: 0 };
    },
    reset(key) {
      hits.delete(key);
    },
  };
}
