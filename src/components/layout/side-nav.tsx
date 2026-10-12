'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavItem } from '@/config/navigation';
import { NavIcon } from './nav-icon';
import styles from './app-shell.module.css';

export function SideNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className={`${styles.nav} no-print`} aria-label="Aula">
      {items.map((item) => {
        const current = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link key={item.href} href={item.href} aria-current={current ? 'page' : undefined} className={styles.navLink}>
            <span className={styles.navIcon}><NavIcon name={item.icon} /></span>
            <span className={styles.navLabel}>{item.label}</span>
            <span className={styles.navShort} aria-hidden="true">{item.short ?? item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
