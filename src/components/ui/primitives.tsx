import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import styles from './primitives.module.css';

// Piezas visuales sin estado (Server Components): no agregan JavaScript al navegador.

export function ProgressBar({ value, color, label }: { value: number; color?: string; label?: string }) {
  const v = Math.min(100, Math.max(0, Math.round(value)));
  return (
    <div
      className={styles.bar}
      role="progressbar"
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      style={{ '--v': `${v}%`, '--c': color } as CSSProperties}
    >
      <i />
    </div>
  );
}

export function Kpi({ label, value, hint, children }: { label: string; value: ReactNode; hint?: ReactNode; children?: ReactNode }) {
  return (
    <div className={styles.kpi}>
      <span>{label}</span>
      <b>{value}</b>
      {hint && <small>{hint}</small>}
      {children}
    </div>
  );
}

export function PageHeader({ title, description, children }: { title: ReactNode; description?: ReactNode; children?: ReactNode }) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children}
    </header>
  );
}

export function SectionTitle({ as: Tag = 'h2', title, action }: { as?: 'h2' | 'h3'; title: ReactNode; action?: ReactNode }) {
  return (
    <div className="section-title">
      <Tag>{title}</Tag>
      {action}
    </div>
  );
}

export function Skeleton({ height = '6rem', className }: { height?: string; className?: string }) {
  return <div className={cn('skeleton', className)} style={{ height }} aria-hidden="true" />;
}

/** Esqueleto genérico de página: se muestra mientras llega el contenido de la sesión. */
export function PageSkeleton() {
  return (
    <div className="page" aria-busy="true" aria-label="Cargando">
      <Skeleton height="3.2rem" className={styles.skTitle} />
      <div className="grid-2"><Skeleton height="9rem" /><Skeleton height="9rem" /></div>
      <div className="split"><Skeleton height="18rem" /><Skeleton height="18rem" /></div>
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className={styles.empty}>{children}</p>;
}
