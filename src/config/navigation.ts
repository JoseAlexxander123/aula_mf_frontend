import type { NavIconName } from '@/components/layout/nav-icon';

// Navegación del alumno (prototipo B: barra lateral fija; en móvil, barra inferior).

export interface NavItem {
  href: string;
  label: string;
  short?: string;
  icon: NavIconName;
}

export const STUDENT_NAV: NavItem[] = [
  { href: '/inicio', label: 'Inicio', icon: 'home' },
  { href: '/ruta', label: 'Mi ruta', icon: 'route' },
  { href: '/lecciones', label: 'Lecciones', icon: 'lessons' },
  { href: '/evaluaciones', label: 'Evaluaciones', short: 'Evaluar', icon: 'exams' },
  { href: '/clases', label: 'Clases y tareas', short: 'Clases', icon: 'classes' },
  { href: '/logros', label: 'Logros', icon: 'trophy' },
];
