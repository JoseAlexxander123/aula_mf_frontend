'use client';

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import styles from './tabs.module.css';

// Pestañas accesibles (patrón WAI-ARIA): flechas, Inicio y Fin mueven el foco; tabindex itinerante.
// Los paneles inactivos quedan montados pero ocultos para conservar su estado
// (p. ej. la práctica a medias cuando el alumno vuelve a ver el video).

export interface TabItem {
  id: string;
  label: ReactNode;
  panel: ReactNode;
  /** Clase extra para el botón (p. ej. color por ruta). */
  tabClassName?: string;
}

type Variant = 'folder' | 'segmented' | 'cards' | 'pills' | 'chips';

interface TabsProps {
  items: TabItem[];
  label: string;
  variant?: Variant;
  defaultTab?: string;
  onChange?: (id: string) => void;
  panelClassName?: string;
}

export function Tabs({ items, label, variant = 'folder', defaultTab, onChange, panelClassName }: TabsProps) {
  const baseId = useId();
  const [active, setActive] = useState(defaultTab ?? items[0]?.id);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const select = (id: string) => {
    setActive(id);
    onChange?.(id);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = items.length - 1;
    const next = { ArrowRight: index + 1, ArrowDown: index + 1, ArrowLeft: index - 1, ArrowUp: index - 1, Home: 0, End: last }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const target = (next + items.length) % items.length;
    tabRefs.current[target]?.focus();
    select(items[target].id);
  };

  return (
    <div className={cn(styles.root, styles[`root_${variant}`])}>
      <div role="tablist" aria-label={label} className={cn(styles.list, styles[`list_${variant}`])}>
        {items.map((item, i) => {
          const selected = item.id === active;
          return (
            <button
              key={item.id}
              ref={(el) => { tabRefs.current[i] = el; }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.id}`}
              aria-controls={`${baseId}-panel-${item.id}`}
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              className={cn(styles.tab, styles[`tab_${variant}`], item.tabClassName)}
              onClick={() => select(item.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`${baseId}-panel-${item.id}`}
          aria-labelledby={`${baseId}-tab-${item.id}`}
          hidden={item.id !== active}
          tabIndex={0}
          className={cn(styles.panel, styles[`panel_${variant}`], panelClassName)}
        >
          {item.panel}
        </div>
      ))}
    </div>
  );
}
