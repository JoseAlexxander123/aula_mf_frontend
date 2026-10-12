'use client';

import { useSyncExternalStore } from 'react';

// Estrellas ganadas en esta visita (aún no reflejadas por el servidor en la cabecera).
// Almacén mínimo sin dependencias: la práctica suma y la cabecera muestra «servidor + ganadas»
// sin volver a renderizar la página completa en el servidor.

let earned = 0;
const listeners = new Set<() => void>();

export function addStars(amount: number) {
  if (amount <= 0) return;
  earned += amount;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useEarnedStars(): number {
  return useSyncExternalStore(subscribe, () => earned, () => 0);
}
