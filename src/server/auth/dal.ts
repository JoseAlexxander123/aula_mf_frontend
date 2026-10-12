import 'server-only';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { cache } from 'react';
import { services, type RequestContext } from '@/services';
import type { Role } from '@/types/domain';
import { HOME_BY_ROLE, LOGIN_PATH } from './constants';
import { readSessionToken } from './session';

// Capa de acceso a datos (DAL): ÚNICO lugar donde se resuelve «quién es el usuario».
// `cache` de React deduplica la verificación dentro de una misma petición: aunque la llamen
// la cabecera, la página y varios componentes, el backend recibe un solo /auth/me.

export interface Session extends RequestContext {
  /** Hora de la petición (ms). Única fuente de «ahora» para renderizar en el servidor. */
  requestedAt: number;
}

export const getSession = cache(async (): Promise<Session | null> => {
  const token = await readSessionToken();
  if (!token) return null;
  // Validar la sesión compara el vencimiento con la hora actual: se declara como trabajo
  // de la petición (no se prerenderiza ni se cachea en el servidor).
  await connection();
  const user = await services.auth.me(token);
  return user ? { token, user, requestedAt: Date.now() } : null;
});

/** Exige sesión (y rol, si se indica). Si no cumple, redirige sin renderizar nada. */
export async function requireSession(role?: Role): Promise<Session> {
  const session = await getSession();
  if (!session) redirect(`${LOGIN_PATH}?expirada=1`);
  if (role && session.user.role !== role) redirect(HOME_BY_ROLE[session.user.role]);
  return session;
}
