'use client';

import { useSyncExternalStore } from 'react';
import styles from './pwa.module.css';

// Aviso de «sin conexión» pegado bajo la cabecera, dentro del contenido (no tapa la barra lateral ni la inferior).
// El contenedor `role="status"` existe siempre para que el lector de pantalla anuncie el cambio cuando aparece el aviso.

function subscribe(onChange: () => void) {
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);
  return () => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
  };
}

export function OfflineBanner() {
  const online = useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
  return (
    <div className={`${styles.region} no-print`} role="status" aria-live="polite">
      {!online && (
        <p className={styles.banner}>
          <b>Sin conexión.</b> No podrás enviar tareas ni respuestas hasta que vuelva la señal.
        </p>
      )}
    </div>
  );
}
