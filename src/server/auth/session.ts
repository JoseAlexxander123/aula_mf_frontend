import 'server-only';
import { cookies } from 'next/headers';
import { env } from '@/config/env';
import type { Role } from '@/types/domain';
import { ROLE_COOKIE, SESSION_COOKIE } from './constants';

// Cookies de sesión. El token del backend .NET vive en una cookie httpOnly:
// JavaScript del navegador no puede leerlo (protección ante XSS).
// `mf_role` solo sirve para redirecciones optimistas en proxy.ts; nunca para autorizar.

const baseCookie = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: 'lax' as const,
  path: '/',
};

export async function readSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

export async function writeSession(token: string, role: Role, maxAgeSec: number) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, { ...baseCookie, maxAge: maxAgeSec });
  store.set(ROLE_COOKIE, role, { ...baseCookie, maxAge: maxAgeSec });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(ROLE_COOKIE);
}
