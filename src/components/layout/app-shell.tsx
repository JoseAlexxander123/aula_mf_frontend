import type { ReactNode } from 'react';
import { Logo } from '@/components/brand/logo';
import { STUDENT_NAV } from '@/config/navigation';
import { cn } from '@/lib/cn';
import { ThemeToggle } from '@/features/theme/theme-toggle';
import styles from './app-shell.module.css';
import { SideNav } from './side-nav';

// Armazón estático del aula: se prerenderiza y llega al instante.
// La parte que depende de la sesión (estrellas, avisos, perfil) entra por `status` dentro de un <Suspense>.

interface Props {
  area: 'student' | 'family';
  status: ReactNode;
  children: ReactNode;
}

export function AppShell({ area, status, children }: Props) {
  const home = area === 'student' ? '/inicio' : '/familia';
  return (
    <div className={cn(styles.shell, area === 'family' && styles.family)}>
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <header className={cn(styles.topbar, 'no-print')}>
        <Logo href={home} />
        <span className={styles.area}>{area === 'student' ? 'Alumno' : 'Familia'}</span>
        <div className={styles.status}>
          <ThemeToggle />
          {status}
        </div>
      </header>
      <div className={styles.frame}>
        {area === 'student' && <SideNav items={STUDENT_NAV} />}
        <main id="contenido" className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
