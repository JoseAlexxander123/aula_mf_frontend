import 'server-only';
import { env } from '@/config/env';
import type { Services } from './contracts';
import { httpServices } from './http';
import { mockServices } from './mock';

/** Punto único de acceso a datos. Cambiar API_MODE=http para usar la API .NET. */
export const services: Services = env.apiMode === 'http' ? httpServices : mockServices;

export const isMockMode = env.apiMode === 'mock';

export type { RequestContext } from './contracts';
