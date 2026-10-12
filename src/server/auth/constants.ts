// Compartido por proxy.ts y la capa de sesión (sin dependencias de servidor para que el proxy lo importe).
import type { Role } from '@/types/domain';

export const SESSION_COOKIE = 'mf_session';
export const ROLE_COOKIE = 'mf_role';

export const LOGIN_PATH = '/ingreso';

export const HOME_BY_ROLE: Record<Role, string> = {
  student: '/inicio',
  family: '/familia',
};

export const STUDENT_PATHS = ['/inicio', '/ruta', '/lecciones', '/evaluaciones', '/clases', '/logros'];
export const FAMILY_PATHS = ['/familia'];
