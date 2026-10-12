'use client';

import { useEffect, useState } from 'react';

// Reloj compartido de baja frecuencia.
// - Arranca con `initial` (hora del servidor) → el HTML del servidor y la hidratación coinciden.
// - Se PAUSA cuando la pestaña está oculta (sin trabajo de CPU en segundo plano) y se
//   sincroniza al volver. Como los cálculos usan la hora real (no un contador), nunca se desfasa.

export function useNow(intervalMs: number, initial: number): number {
  const [now, setNow] = useState(initial);

  useEffect(() => {
    let timer: number | undefined;
    const tick = () => setNow(Date.now());
    const start = () => {
      tick();
      timer = window.setInterval(tick, intervalMs);
    };
    const stop = () => window.clearInterval(timer);
    const onVisibility = () => (document.hidden ? stop() : start());

    if (!document.hidden) start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [intervalMs]);

  return now;
}
