/* Service worker del aula virtual · Mate Fácil.

   Alcance deliberadamente pequeño y seguro (el aula maneja sesiones de menores y notas):
   - NUNCA guarda HTML, datos (RSC), Server Actions ni respuestas de la API: así un celular compartido
     jamás muestra datos de otro alumno ni notas viejas. Todo eso va siempre a la red.
   - Guarda solo archivos estáticos inmutables (/_next/static con hash) y la marca → cargas repetidas más rápidas.
   - Si una navegación falla por falta de red, muestra /offline.html (autosuficiente) en lugar del error del navegador.

   Para publicar cambios de este archivo basta con editarlo: el navegador lo revisa en cada visita (ver next.config.ts,
   cabecera Cache-Control: no-cache). Si cambia la lista PRECACHE, subir VERSION para renovar las cachés. */

const VERSION = 'v1';
const PRECACHE_NAME = `mf-precache-${VERSION}`;
const ASSETS_NAME = `mf-assets-${VERSION}`;
const OFFLINE_URL = '/offline.html';
const PRECACHE = [
  OFFLINE_URL,
  '/brand/logo-matefacil.webp',
  '/brand/logo-matefacil-360.png',
  '/icons/icon-192.png',
];
// Tope de archivos guardados de /_next/static: cada despliegue trae nombres nuevos y los viejos se descartan primero.
const MAX_ASSETS = 150;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE_NAME).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([PRECACHE_NAME, ASSETS_NAME]);
      const names = await caches.keys();
      await Promise.all(names.filter((n) => n.startsWith('mf-') && !keep.has(n)).map((n) => caches.delete(n)));
      await self.clients.claim();
    })(),
  );
});

async function trim(cache, max) {
  const keys = await cache.keys();
  // keys() devuelve en orden de inserción: se descartan los más antiguos.
  await Promise.all(keys.slice(0, Math.max(0, keys.length - max)).map((k) => cache.delete(k)));
}

async function cacheFirst(request) {
  const cache = await caches.open(ASSETS_NAME);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (response.ok) {
    await cache.put(request, response.clone());
    await trim(cache, MAX_ASSETS);
  }
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(PRECACHE_NAME);
  const hit = await cache.match(request);
  const refresh = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);
  return hit ?? (await refresh) ?? Response.error();
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || request.headers.has('range')) return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Páginas: siempre la red; solo si falla se muestra la pantalla «sin conexión».
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => (await caches.match(OFFLINE_URL)) ?? Response.error()),
    );
    return;
  }

  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (url.pathname.startsWith('/brand/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(staleWhileRevalidate(request));
  }
  // Cualquier otra cosa (datos RSC, acciones, API): no se intercepta.
});
