import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import styles from '@/features/auth/components/login.module.css';
import { ThemeToggle } from '@/features/theme/theme-toggle';

export default function NotFound() {
  return (
    <main className={styles.screen}>
      <ThemeToggle floating />
      <div className={styles.card}>
        <div className={styles.brand}><Logo size="hero" withLabel={false} /></div>
        <h1>Esta página no existe</h1>
        <p className={styles.lead}>Puede que el enlace esté mal escrito o que la página se haya movido.</p>
        <Link className="btn btn--primary btn--lg" href="/">Volver a mi aula</Link>
      </div>
    </main>
  );
}
