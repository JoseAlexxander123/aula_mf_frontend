import type { NextConfig } from 'next';

// Cabeceras de seguridad comunes. La CSP estricta se puede agregar cuando se conozcan
// los dominios definitivos del backend .NET y del reproductor de video.
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,

  // VPS: `standalone` genera un servidor mínimo (sin node_modules completos) → menos disco y RAM.
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,

  // Las imágenes de marca ya vienen optimizadas (webp). Desactivar la optimización en tiempo real
  // evita que `sharp` consuma CPU/RAM del VPS en cada petición.
  images: { unoptimized: true },

  // Si el VPS tiene Nginx/Caddy delante comprimiendo, poner NEXT_COMPRESS=false
  // para no comprimir dos veces (ahorra CPU).
  compress: process.env.NEXT_COMPRESS !== 'false',

  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // PWA: el service worker nunca debe quedar en caché (si no, una versión vieja podría seguir mandando).
      {
        source: '/sw.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self'" },
        ],
      },
      // La pantalla «sin conexión» se revalida siempre: el service worker guarda su propia copia.
      { source: '/offline.html', headers: [{ key: 'Cache-Control', value: 'no-cache' }] },
    ];
  },
};

export default nextConfig;
