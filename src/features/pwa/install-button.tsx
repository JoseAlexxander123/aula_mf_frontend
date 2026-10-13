'use client';

import { useState, useSyncExternalStore } from 'react';
import { DownloadIcon } from '@/components/ui/icons';
import { getInstallState, getServerInstallState, promptInstall, subscribeInstall } from './install-store';
import styles from './pwa.module.css';

// «Instalar la app» dentro del menú de perfil. Solo aparece si se puede instalar y todavía no está instalada:
// Chrome/Edge/Android → botón que abre el diálogo nativo; Safari/iOS → indicación del paso manual.

export function InstallButton() {
  const state = useSyncExternalStore(subscribeInstall, getInstallState, getServerInstallState);
  const [busy, setBusy] = useState(false);

  if (state === 'prompt') {
    const install = async () => {
      setBusy(true);
      try {
        await promptInstall();
      } finally {
        setBusy(false);
      }
    };
    return (
      <div className={styles.install}>
        <button type="button" className="btn btn--sm" onClick={install} disabled={busy}>
          <DownloadIcon /> Instalar la app
        </button>
      </div>
    );
  }

  if (state === 'ios') {
    return (
      <div className={styles.install}>
        <p className={styles.title}>Instalar la app</p>
        <p className={styles.hint}>
          Toca <b>Compartir</b> y luego <b>«Añadir a pantalla de inicio»</b>.
        </p>
      </div>
    );
  }

  return null;
}
