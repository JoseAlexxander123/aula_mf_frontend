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
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
