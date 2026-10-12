'use client';

import { useEffect } from 'react';
import styles from './route-error.module.css';

// Pantalla de error amable para cualquier sección (API caída, tiempo agotado, etc.).
// Los detalles técnicos van a la consola / observabilidad, no al alumno.

export function RouteError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={styles.box} role="alert">
      <span className={styles.icon} aria-hidden="true">🛠️</span>
      <h2>No pudimos cargar esta sección</h2>
      <p>Puede ser tu conexión o que el aula esté tardando en responder. Tu progreso está guardado.</p>
      <button type="button" className="btn btn--primary" onClick={() => retry()}>Intentar de nuevo</button>
      {error.digest && <small>Código: {error.digest}</small>}
    </div>
  );
}
