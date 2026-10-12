// Errores tipados de la capa HTTP. Las pantallas los traducen a mensajes amables
// (ver `toUserMessage`) sin filtrar detalles internos del backend.

export type ApiErrorCode = 'timeout' | 'network' | 'unauthorized' | 'forbidden' | 'not_found' | 'rate_limited' | 'validation' | 'server';

export class ApiError extends Error {
  constructor(
    readonly code: ApiErrorCode,
    message: string,
    readonly status?: number,
    /** Segundos sugeridos antes de reintentar (cabecera Retry-After). */
    readonly retryAfterSec?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function codeFromStatus(status: number): ApiErrorCode {
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status === 408) return 'timeout';
  if (status === 429) return 'rate_limited';
  if (status === 400 || status === 422) return 'validation';
  return 'server';
}

const userMessages: Record<ApiErrorCode, string> = {
  timeout: 'El servidor tardó demasiado en responder. Inténtalo de nuevo en unos segundos.',
  network: 'No pudimos conectarnos con el aula. Revisa tu conexión a internet.',
  unauthorized: 'Tu sesión terminó. Vuelve a ingresar.',
  forbidden: 'No tienes permiso para ver esto.',
  not_found: 'No encontramos lo que buscas.',
  rate_limited: 'Hiciste muchas solicitudes seguidas. Espera un momento.',
  validation: 'Revisa los datos ingresados.',
  server: 'Algo salió mal de nuestro lado. Ya estamos revisándolo.',
};

export function toUserMessage(error: unknown): string {
  if (error instanceof ApiError) return userMessages[error.code];
  return userMessages.server;
}
