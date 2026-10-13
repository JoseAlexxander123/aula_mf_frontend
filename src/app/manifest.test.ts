import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { STUDENT_NAV } from '@/config/navigation';
import manifest from './manifest';

// Verifican lo que el navegador exige para ofrecer «Instalar app» y lo que el service worker promete guardar.
// Si alguien renombra un icono o cambia una ruta, falla aquí y no en el celular de una familia.

const publicPath = (src: string) => join(process.cwd(), 'public', src);

/** Ancho y alto de un PNG leídos de su cabecera (bytes 16–23, enteros de 32 bits). */
function pngSize(file: string): string {
  const buf = readFileSync(file);
  return `${buf.readUInt32BE(16)}x${buf.readUInt32BE(20)}`;
}

describe('manifest de la PWA', () => {
  const m = manifest();

  it('cumple lo mínimo para instalarse', () => {
    expect(m.name).toBeTruthy();
    expect(m.short_name && m.short_name.length).toBeLessThanOrEqual(12);
    expect(m.display).toBe('standalone');
    expect(m.start_url).toBe('/');
    expect(m.scope).toBe('/');
    expect(m.lang).toBe('es');
  });

  it('declara iconos de 192 y 512 y uno «maskable»', () => {
    const icons = m.icons ?? [];
    expect(icons.some((i) => i.sizes === '192x192' && i.purpose === 'any')).toBe(true);
    expect(icons.some((i) => i.sizes === '512x512' && i.purpose === 'any')).toBe(true);
    expect(icons.some((i) => i.sizes === '512x512' && i.purpose === 'maskable')).toBe(true);
  });

  it('cada icono existe y mide lo que declara', () => {
    for (const icon of [...(m.icons ?? []), ...(m.shortcuts ?? []).flatMap((s) => s.icons ?? [])]) {
      const file = publicPath(icon.src);
      expect(existsSync(file), icon.src).toBe(true);
      expect(pngSize(file), icon.src).toBe(icon.sizes);
    }
  });

  it('los accesos directos llevan a pantallas reales del alumno', () => {
    const routes = STUDENT_NAV.map((n) => n.href);
    for (const shortcut of m.shortcuts ?? []) expect(routes, shortcut.name).toContain(shortcut.url);
  });
});

describe('service worker', () => {
  const source = readFileSync(publicPath('sw.js'), 'utf8');

  it('solo precachea archivos que existen (si no, la instalación del SW falla entera)', () => {
    const offlineUrl = source.match(/const OFFLINE_URL = '([^']+)'/)?.[1] ?? '';
    const list = (source.match(/const PRECACHE = \[([\s\S]*?)\];/)?.[1] ?? '').replace('OFFLINE_URL', `'${offlineUrl}'`);
    const entries = [...list.matchAll(/'([^']+)'/g)].map((x) => x[1]).filter((x) => x.startsWith('/'));
    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) expect(existsSync(publicPath(entry)), entry).toBe(true);
    expect(entries).toContain('/offline.html');
  });

  it('solo toca peticiones GET del mismo origen y nunca guarda páginas (HTML autenticado)', () => {
    expect(source).toContain("request.method !== 'GET'");
    expect(source).toContain('url.origin !== self.location.origin');
    // Las navegaciones se resuelven por red; la caché solo se consulta para la pantalla sin conexión.
    const navigate = source.slice(source.indexOf("request.mode === 'navigate'"), source.indexOf("startsWith('/_next/static/')"));
    expect(navigate).not.toContain('cache.put');
    expect(navigate).toContain('OFFLINE_URL');
  });
});
