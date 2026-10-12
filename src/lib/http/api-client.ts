import 'server-only';
import { env } from '@/config/env';
import { ApiError, codeFromStatus } from './errors';

// Cliente HTTP hacia la API .NET. Solo corre en el servidor de Next (BFF):
// el token viaja en una cookie httpOnly y nunca se expone al navegador.
//
// - Límite de tiempo por petición (AbortSignal.timeout) → una API lenta no bloquea el VPS.
// - Un reintento con espera corta solo para lecturas (GET) ante errores de red / 502-504.
// - Errores normalizados en ApiError.

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions {
  method?: Method;
  body?: unknown;
  token?: string;
  timeoutMs?: number;
  /** Reintentos para peticiones idempotentes. Por defecto 1 en GET y 0 en el resto. */
  retries?: number;
  signal?: AbortSignal;
}

const RETRYABLE_STATUS = new Set([502, 503, 504]);
const RETRY_DELAY_MS = 300;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token, timeoutMs = env.apiTimeoutMs, signal } = options;
  const retries = options.retries ?? (method === 'GET' ? 1 : 0);
  const url = `${env.apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  for (let attempt = 0; ; attempt++) {
    const timeout = AbortSignal.timeout(timeoutMs);
    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
        cache: 'no-store',
      });

      if (!response.ok) {
        if (attempt < retries && RETRYABLE_STATUS.has(response.status)) {
          await wait(RETRY_DELAY_MS * (attempt + 1));
          continue;
        }
        const retryAfter = Number(response.headers.get('Retry-After')) || undefined;
        throw new ApiError(codeFromStatus(response.status), `${method} ${path} → ${response.status}`, response.status, retryAfter);
      }

      if (response.status === 204) return undefined as T;
      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      const isTimeout = error instanceof DOMException && (error.name === 'TimeoutError' || error.name === 'AbortError');
      if (!isTimeout && attempt < retries) {
        await wait(RETRY_DELAY_MS * (attempt + 1));
        continue;
      }
      throw new ApiError(isTimeout ? 'timeout' : 'network', `${method} ${path}: ${(error as Error).message}`);
    }
  }
}
