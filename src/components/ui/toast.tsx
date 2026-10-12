'use client';

import { createContext, use, useCallback, useMemo, useRef, useState } from 'react';
import styles from './toast.module.css';

// Avisos breves (toasts) accesibles: se anuncian por lector de pantalla y se cierran solos.
// Un temporizador por aviso; se limpian al cerrarse (sin intervalos permanentes).

type Tone = 'info' | 'success' | 'error';
interface Toast { id: number; message: string; tone: Tone }

interface ToastApi {
  notify: (message: string, tone?: Tone) => void;
}

const ToastContext = createContext<ToastApi | null>(null);
const DURATION_MS = 4000;
const MAX_VISIBLE = 3;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const notify = useCallback((message: string, tone: Tone = 'info') => {
    const id = ++nextId.current;
    setToasts((list) => [...list.slice(-(MAX_VISIBLE - 1)), { id, message, tone }]);
    window.setTimeout(() => dismiss(id), DURATION_MS);
  }, [dismiss]);

  const api = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext value={api}>
      {children}
      <div className={styles.region} role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`${styles.toast} ${styles[t.tone]}`}>
            <span>{t.message}</span>
            <button type="button" onClick={() => dismiss(t.id)} aria-label="Cerrar aviso">×</button>
          </div>
        ))}
      </div>
    </ToastContext>
  );
}

export function useToast(): ToastApi {
  const ctx = use(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return ctx;
}
