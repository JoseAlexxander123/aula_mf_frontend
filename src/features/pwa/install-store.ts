// Estado de «instalar la app» sin dependencias: se lee con useSyncExternalStore.
//
// Chrome/Edge/Android avisan con `beforeinstallprompt` UNA sola vez y suele llegar antes de que React hidrate;
// por eso lo captura un script en línea en <head> (PWA_INIT_SCRIPT) y aquí solo se lee `window.__mfInstallEvent`.
// Safari/iOS no tiene ese evento: allí solo se puede explicar el paso manual «Compartir → Añadir a pantalla de inicio».

export type InstallState = 'installed' | 'prompt' | 'ios' | 'none';

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface Window {
    __mfInstallEvent?: InstallPromptEvent;
  }
}

export const INSTALL_CHANGE_EVENT = 'mf-install-change';

/** Se ejecuta en <head> antes de hidratar para no perder el aviso de instalación. */
export const PWA_INIT_SCRIPT = `(function(){var c='${INSTALL_CHANGE_EVENT}';window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__mfInstallEvent=e;window.dispatchEvent(new Event(c))});window.addEventListener('appinstalled',function(){window.__mfInstallEvent=undefined;window.dispatchEvent(new Event(c))})})()`;

const STANDALONE_QUERY = '(display-mode: standalone)';

function isStandalone(): boolean {
  return matchMedia(STANDALONE_QUERY).matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function isIos(): boolean {
  // iPadOS 13+ se presenta como «Macintosh»: se distingue por la pantalla táctil.
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export function getInstallState(): InstallState {
  if (isStandalone()) return 'installed';
  if (window.__mfInstallEvent) return 'prompt';
  if (isIos()) return 'ios';
  return 'none';
}

export const getServerInstallState = (): InstallState => 'none';

export function subscribeInstall(onChange: () => void): () => void {
  const media = matchMedia(STANDALONE_QUERY);
  window.addEventListener(INSTALL_CHANGE_EVENT, onChange);
  media.addEventListener('change', onChange);
  return () => {
    window.removeEventListener(INSTALL_CHANGE_EVENT, onChange);
    media.removeEventListener('change', onChange);
  };
}

/** Abre el diálogo nativo de instalación. El evento solo sirve una vez: se descarta al usarlo. */
export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  const event = window.__mfInstallEvent;
  if (!event) return 'unavailable';
  await event.prompt();
  const { outcome } = await event.userChoice;
  window.__mfInstallEvent = undefined;
  window.dispatchEvent(new Event(INSTALL_CHANGE_EVENT));
  return outcome;
}
