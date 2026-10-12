import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Nunito } from 'next/font/google';
import { ToastProvider } from '@/components/ui/toast';
import { THEME_COLOR, THEME_INIT_SCRIPT } from '@/features/theme/theme';
import './globals.css';

// Fuentes autoalojadas por next/font (sin peticiones a Google en tiempo de ejecución).
// Versiones variables: un solo archivo por familia cubre todos los pesos que usa el tema.
const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const sans = Nunito({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Aula virtual · Mate Fácil', template: '%s · Aula Mate Fácil' },
  description: 'Aula virtual de Mate Fácil Academy: clases en vivo, práctica, evaluaciones y progreso para alumnos y familias.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: THEME_COLOR.light,
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // data-theme lo corrige el script antes de pintar → suppressHydrationWarning evita el aviso de React.
    <html lang="es" data-theme="light" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
