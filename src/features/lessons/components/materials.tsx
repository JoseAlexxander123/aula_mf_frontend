import type { Material } from '@/types/domain';
import styles from './lesson.module.css';

export function MaterialsList({ materials }: { materials: Material[] }) {
  return (
    <ul role="list" className={styles.materials}>
      {materials.map((m) => (
        <li key={m.id}>
          <span aria-hidden="true">📄</span>
          {m.name}
          <a href={m.url} download className="link">Descargar</a>
        </li>
      ))}
    </ul>
  );
}
