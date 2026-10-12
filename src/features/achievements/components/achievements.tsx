import type { CSSProperties } from 'react';
import { AREA_COLOR } from '@/config/areas';
import { cn } from '@/lib/cn';
import type { Badge, Certificate, PortfolioItem } from '@/types/domain';
import { CopyButton } from './copy-button';
import styles from './achievements.module.css';

export function BadgeGrid({ badges }: { badges: Badge[] }) {
  return (
    <ul role="list" className={styles.badges}>
      {badges.map((b) => (
        <li key={b.id} className={cn(!b.earned && styles.locked)} title={b.detail}>
          <span className={styles.badgeIcon} aria-hidden="true">{b.icon}</span>
          <b>{b.name}</b>
          <small>{b.earned ? b.detail : `Por ganar: ${b.detail}`}</small>
        </li>
      ))}
    </ul>
  );
}

export function PortfolioGrid({ items }: { items: PortfolioItem[] }) {
  return (
    <ul role="list" className={styles.portfolio}>
      {items.map((p) => (
        <li key={p.id} style={{ '--c': AREA_COLOR[p.area] } as CSSProperties}>
          <div className={styles.cover} aria-hidden="true"><span>{p.lab}</span></div>
          <b>{p.title}</b>
          <small>{p.lab} · {p.dateLabel}</small>
          <p>{p.note}</p>
          {p.status === 'in-progress' && <span className="pill">En curso</span>}
        </li>
      ))}
    </ul>
  );
}

export function CertificateList({ certificates }: { certificates: Certificate[] }) {
  return (
    <ul role="list" className={styles.certificates}>
      {certificates.map((c) =>
        c.code ? (
          <li key={c.id}>
            <span className={styles.seal} aria-hidden="true">✓</span>
            <div>
              <b>{c.name}</b>
              <small>{c.dateLabel} · Código <code>{c.code}</code> <CopyButton value={c.code} label="Copiar código" /></small>
            </div>
            {c.downloadUrl && <a className="link" href={c.downloadUrl} download>Descargar</a>}
          </li>
        ) : (
          <li key={c.id} className={styles.certPending}>
            <span className={styles.seal} aria-hidden="true">…</span>
            <div><b>{c.name}</b><small>{c.requirement}</small></div>
          </li>
        ),
      )}
    </ul>
  );
}
