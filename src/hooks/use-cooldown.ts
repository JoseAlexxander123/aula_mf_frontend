'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Enfriamiento en el navegador: tras una acción, bloquea la siguiente durante `ms`.
 * Evita dobles clics y ráfagas (primera barrera; el servidor aplica su propio límite).
 * `lock(ms)` también acepta un bloqueo largo (p. ej. el «espera 60 s» que devuelve el servidor).
 */
export function useCooldown(defaultMs: number) {
  const [locked, setLocked] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const lock = useCallback((ms = defaultMs) => {
    setLocked(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setLocked(false), ms);
  }, [defaultMs]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return { locked, lock };
}
