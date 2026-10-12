import { NextResponse, type NextRequest } from 'next/server';
import { FAMILY_PATHS, HOME_BY_ROLE, LOGIN_PATH, ROLE_COOKIE, SESSION_COOKIE, STUDENT_PATHS } from '@/server/auth/constants';
import type { Role } from '@/types/domain';

// Comprobación OPTIMISTA (solo mira si existen cookies, sin llamar al backend → casi sin CPU).
// La verificación real del token ocurre en el DAL (server/auth/dal.ts) y en cada Server Action.

const matches = (pathname: string, prefixes: string[]) => prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);
  const role = request.cookies.get(ROLE_COOKIE)?.value as Role | undefined;
  const home = role && role in HOME_BY_ROLE ? HOME_BY_ROLE[role] : null;

  // El DAL detectó un token inválido/vencido: se borran las cookies para no rebotar entre páginas.
  if (pathname === LOGIN_PATH && request.nextUrl.searchParams.has('expirada')) {
    const response = NextResponse.next();
    response.cookies.delete(SESSION_COOKIE);
    response.cookies.delete(ROLE_COOKIE);
    return response;
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL(hasSession && home ? home : LOGIN_PATH, request.url));
  }

  const isProtected = matches(pathname, STUDENT_PATHS) || matches(pathname, FAMILY_PATHS);
  if (isProtected && !hasSession) {
    const url = new URL(LOGIN_PATH, request.url);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Un alumno no entra al panel de familia ni al revés.
  if (hasSession && home) {
    const wrongArea = (role === 'student' && matches(pathname, FAMILY_PATHS)) || (role === 'family' && matches(pathname, STUDENT_PATHS));
    if (wrongArea) return NextResponse.redirect(new URL(home, request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Solo páginas: se excluyen estáticos, imágenes y archivos con extensión.
  matcher: ['/((?!_next/static|_next/image|brand/|favicon.ico|apple-icon.png|.*\\..*).*)'],
};
