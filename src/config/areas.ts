import type { LabArea } from '@/types/domain';

export const AREA_COLOR: Record<LabArea, string> = {
  'Programación': 'var(--area-programacion)',
  'Inteligencia Artificial': 'var(--area-ia)',
  'Habilidades digitales': 'var(--area-digitales)',
};

export const TRACK_COLOR = {
  math: 'var(--acento)',
  lab: 'var(--ruta-creator)',
} as const;
