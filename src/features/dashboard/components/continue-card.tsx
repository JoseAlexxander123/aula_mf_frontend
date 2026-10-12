import Link from 'next/link';
import type { CSSProperties } from 'react';
import { ProgressBar } from '@/components/ui/primitives';
import styles from './dashboard.module.css';

// «Siguiente paso recomendado»: retomar la lección actual de cada ruta con un clic.

interface Props {
  eyebrow: string;
  title: string;
  progress: number;
  caption: string;
  href: string;
  cta: string;
  color: string;
  primary?: boolean;
}

export function ContinueCard({ eyebrow, title, progress, caption, href, cta, color, primary }: Props) {
  return (
    <section className={styles.continue} style={{ '--shadow': color } as CSSProperties}>
      <div className={styles.continueBody}>
        <small>{eyebrow}</small>
        <h2>{title}</h2>
        <ProgressBar value={progress} color={color} label={`Avance: ${progress} %`} />
        <small>{caption}</small>
      </div>
      <Link className={primary ? 'btn btn--primary' : 'btn'} href={href}>{cta}</Link>
    </section>
  );
}
