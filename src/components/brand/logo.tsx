import Link from 'next/link';
import styles from './logo.module.css';

// Logo oficial de Mate Fácil Academy (mismo archivo que la web en Astro: birrete + «Mate Fácil» + franja ACADEMY).
// <picture> con WebP y respaldo PNG; tamaño fijo para evitar saltos de diseño (CLS).

export function Logo({ href, size = 'header', withLabel = true }: { href?: string; size?: 'header' | 'hero'; withLabel?: boolean }) {
  const content = (
    <>
      <picture className={styles[size]}>
        <source srcSet="/brand/logo-matefacil.webp" type="image/webp" />
        <img src="/brand/logo-matefacil-360.png" width={295} height={360} alt="Mate Fácil Academy" decoding="async" fetchPriority="high" />
      </picture>
      {withLabel && <span className={styles.label}>Aula virtual</span>}
    </>
  );
  return href ? (
    <Link href={href} className={styles.brand} aria-label="Mate Fácil · inicio del aula">
      {content}
    </Link>
  ) : (
    <span className={styles.brand}>{content}</span>
  );
}
