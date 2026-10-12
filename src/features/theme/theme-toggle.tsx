'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { MoonIcon, SunIcon } from '@/components/ui/icons';
import { THEME_COLOR, THEME_STORAGE_KEY, type Theme } from './theme';
import styles from './theme-toggle.module.css';

// Botón sol/luna. La fuente de verdad es el atributo data-theme de <html> (lo fija el script inicial),
// así todos los botones de la página quedan sincronizados sin contexto ni re-renders extra.

const html = () => document.documentElement;
const readTheme = (): Theme => (html().getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(html(), { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}

function applyTheme(theme: Theme) {
  html().setAttribute('data-theme', theme);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
}

function savedChoice(): string | null {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function ThemeToggle({ floating = false }: { floating?: boolean }) {
  // En el servidor no se conoce el tema: se asume claro y el botón se corrige al hidratar (solo cambia su icono).
  const theme = useSyncExternalStore(subscribe, readTheme, () => 'light' as Theme);
  const dark = theme === 'dark';

  // Mientras el usuario no elija, el aula sigue los cambios del sistema (p. ej. modo nocturno automático).
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const onSystemChange = (e: MediaQueryListEvent) => {
      if (!savedChoice()) applyTheme(e.matches ? 'dark' : 'light');
    };
    media.addEventListener('change', onSystemChange);
    return () => media.removeEventListener('change', onSystemChange);
  }, []);

  const toggle = () => {
    const next: Theme = dark ? 'light' : 'dark';
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next === 'dark' ? 'oscuro' : 'claro');
    } catch {
      // modo privado sin almacenamiento: el cambio dura solo esta visita
    }
    applyTheme(next);
  };

  return (
    <button
      type="button"
      className={floating ? `${styles.toggle} ${styles.floating}` : styles.toggle}
      onClick={toggle}
      aria-pressed={dark}
      aria-label={dark ? 'Activar modo claro' : 'Activar modo oscuro'}
      title={dark ? 'Modo claro' : 'Modo oscuro'}
    >
      <span key={theme} className={styles.icon} aria-hidden="true">{dark ? <SunIcon /> : <MoonIcon />}</span>
    </button>
  );
}
