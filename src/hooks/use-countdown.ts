'use client';

import { useEffect, useRef } from 'react';
import { useNow } from './use-now';

interface CountdownOptions {
  /** Instante límite (ms epoch) fijado por el servidor. */
  deadlineMs: number;
  /** Hora del navegador cuando se recibió el límite (se mide en el manejador del evento). */
  initialNow: number;
  /** Diferencia reloj servidor − reloj navegador, para no depender de un reloj local mal configurado. */
  clockOffsetMs?: number;
  onExpire?: () => void;
  enabled?: boolean;
}

/** Cuenta regresiva hasta un límite del servidor. Llama a `onExpire` una sola vez. */
export function useCountdown({ deadlineMs, initialNow, clockOffsetMs = 0, onExpire, enabled = true }: CountdownOptions) {
  const now = useNow(1000, initialNow);
  const onExpireRef = useRef(onExpire);
  const firedRef = useRef(false);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const remainingSec = Math.max(0, Math.ceil((deadlineMs - (now + clockOffsetMs)) / 1000));

  useEffect(() => {
    if (enabled && remainingSec === 0 && !firedRef.current) {
      firedRef.current = true;
      onExpireRef.current?.();
    }
  }, [enabled, remainingSec]);

  return { remainingSec, expired: remainingSec === 0 };
}
