import type { MetadataRoute } from 'next';

// Manifiesto de la PWA: permite instalar el aula en el celular, tablet o computador.
// `start_url: '/'` es a propósito: el proxy redirige según la sesión (alumno → /inicio, familia → /familia, sin sesión → /ingreso).
// Los colores replican los tokens del tema claro (globals.css): --fondo para el splash y --sup para la barra del sistema.
// El color de la barra en modo oscuro lo ajusta el <meta name="theme-color"> (ver features/theme).

type ManifestIcon = NonNullable<MetadataRoute.Manifest['icons']>[number];

const icon = (size: number, purpose: 'any' | 'maskable' = 'any'): ManifestIcon => ({
  src: purpose === 'maskable' ? `/icons/icon-maskable-${size}.png` : `/icons/icon-${size}.png`,
  sizes: `${size}x${size}`,
  type: 'image/png',
  purpose,
});

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Aula virtual · Mate Fácil',
    short_name: 'Mate Fácil',
    description: 'Clases en vivo, práctica, evaluaciones y progreso de Mate Fácil Academy para alumnos y familias.',
    lang: 'es',
    dir: 'ltr',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#f6f8ff',
    theme_color: '#ffffff',
    categories: ['education', 'kids'],
    icons: [icon(192), icon(512), icon(512, 'maskable')],
    shortcuts: [
      { name: 'Inicio', url: '/inicio', icons: [icon(192)] },
      { name: 'Evaluaciones', url: '/evaluaciones', icons: [icon(192)] },
      { name: 'Clases y tareas', short_name: 'Clases', url: '/clases', icons: [icon(192)] },
    ],
  };
}
