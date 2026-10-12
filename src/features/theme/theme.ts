// Modo oscuro. Misma convención que la web en Astro: clave «mf-tema» con «claro» | «oscuro»;
// sin elección guardada se sigue la preferencia del sistema.
// El tema vive en el navegador (localStorage), así el layout raíz sigue siendo estático (sin leer cookies).

export const THEME_STORAGE_KEY = 'mf-tema';

export type Theme = 'light' | 'dark';

export const THEME_COLOR: Record<Theme, string> = { light: '#ffffff', dark: '#182238' };

/**
 * Se ejecuta en <head> ANTES del primer pintado: aplica el tema guardado o el del sistema
 * para que no haya un destello de tema claro al cargar en oscuro.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem('${THEME_STORAGE_KEY}');var d=s?s==='oscuro':matchMedia('(prefers-color-scheme: dark)').matches;var t=d?'dark':'light';document.documentElement.setAttribute('data-theme',t);var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',d?'${THEME_COLOR.dark}':'${THEME_COLOR.light}')}catch(e){}})()`;
