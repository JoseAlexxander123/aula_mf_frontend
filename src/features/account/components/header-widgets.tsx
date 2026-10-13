'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState, useTransition } from 'react';
import { cn } from '@/lib/cn';
import { relativeFromNow } from '@/lib/time';
import type { AppNotification } from '@/types/domain';
import { logoutAction } from '@/features/auth/actions';
import { InstallButton } from '@/features/pwa/install-button';
import { markNotificationsReadAction } from '../actions';
import { useEarnedStars } from '../stars-store';
import styles from './header.module.css';

// Piezas interactivas de la cabecera. Los menús se cierran con Escape o clic fuera,
// usando un solo listener que existe solo mientras el menú está abierto.

function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && close();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);
  return ref;
}

export function StarsChip({ initial }: { initial: number }) {
  const earned = useEarnedStars();
  // `key` cambia al ganar estrellas → el elemento se recrea y la animación corta (solo transform) se repite.
  return (
    <span key={earned} className={cn('chip', styles.headChip, styles.stars, earned > 0 && styles.bump)} title="Estrellas" aria-live="polite">
      ⭐ {initial + earned}
    </span>
  );
}

export function NotificationsBell({ items, serverNow }: { items: AppNotification[]; serverNow: number }) {
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState(() => items.every((n) => n.read));
  const [, startTransition] = useTransition();
  const close = () => setOpen(false);
  const ref = useDismiss(open, close);
  const panelId = useId();
  const unread = read ? 0 : items.filter((n) => !n.read).length;

  const toggle = () => {
    setOpen((o) => !o);
    if (!read) {
      setRead(true); // optimista: la marca se guarda en segundo plano
      startTransition(async () => { await markNotificationsReadAction(); });
    }
  };

  return (
    <div className={styles.menuRoot} ref={ref}>
      <button type="button" className={styles.iconBtn} aria-expanded={open} aria-controls={panelId} onClick={toggle} aria-label={unread ? `${unread} avisos nuevos` : 'Avisos'}>
        🔔{unread > 0 && <i className={styles.badge}>{unread}</i>}
      </button>
      <div id={panelId} className={styles.panel} hidden={!open}>
        <p className={styles.panelTitle}>Avisos</p>
        {items.length === 0 ? (
          <p className={styles.empty}>No tienes avisos.</p>
        ) : (
          <ul role="list" className={styles.list}>
            {items.map((n) => (
              <li key={n.id}>
                {n.href ? <Link href={n.href} onClick={close}><b>{n.title}</b></Link> : <b>{n.title}</b>}
                <small>{n.detail} · {relativeFromNow(n.createdAt, serverNow)}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function UserMenu({ name, avatar, subtitle, textAvatar }: { name: string; avatar: string; subtitle?: string; textAvatar?: boolean }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useDismiss(open, () => setOpen(false));
  const panelId = useId();

  const logout = () =>
    startTransition(async () => {
      await logoutAction();
      // Recarga completa A PROPÓSITO (no router.push): limpia todo el estado del cliente,
      // incluidas las rutas que <Activity> mantiene ocultas en memoria.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign('/ingreso');
    });

  return (
    <div className={styles.menuRoot} ref={ref}>
      <button type="button" className={cn(styles.avatar, textAvatar && styles.avatarText)} aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((o) => !o)} aria-label={`Perfil de ${name}`}>
        {avatar}
      </button>
      <div id={panelId} className={styles.panel} hidden={!open}>
        <p className={styles.panelTitle}>{name}</p>
        {subtitle && <p className={styles.empty}>{subtitle}</p>}
        <InstallButton />
        <button type="button" className="btn btn--sm" onClick={logout} disabled={pending}>
          {pending ? 'Saliendo…' : 'Cerrar sesión'}
        </button>
      </div>
    </div>
  );
}
