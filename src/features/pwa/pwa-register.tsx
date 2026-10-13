'use client';

import { useEffect } from 'react';

// Registra el service worker (public/sw.js) solo en producción y después de que la página terminó de cargar,
// para no competir con el primer pintado. No pinta nada.

const CACHE_PREFIX = 'mf-';

export function PwaRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    if (process.env.NODE_ENV !== 'production') {
      // En desarrollo un service worker de una build anterior serviría archivos viejos del puerto 3000: se retira.
      void navigator.serviceWorker.getRegistrations().then((list) => list.forEach((r) => void r.unregister()));
      void caches.keys().then((names) => names.filter((n) => n.startsWith(CACHE_PREFIX)).forEach((n) => void caches.delete(n)));
      return;
    }

    let registration: ServiceWorkerRegistration | undefined;
    const register = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/', updateViaCache: 'none' })
        .then((r) => { registration = r; })
        .catch(() => {
          // Sin service worker el aula funciona igual (solo se pierde la instalación y la pantalla sin conexión).
        });
    };
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });

    // La app instalada puede quedar abierta días: al volver a primer plano se busca una versión nueva.
    const onVisible = () => {
      if (document.visibilityState === 'visible') void registration?.update().catch(() => {});
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('load', register);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return null;
}
