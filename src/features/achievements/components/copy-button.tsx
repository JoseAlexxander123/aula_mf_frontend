'use client';

import { useToast } from '@/components/ui/toast';

/** Copia un texto (código de certificado, enlace del portafolio) al portapapeles. */
export function CopyButton({ value, label, children }: { value: string; label: string; children?: React.ReactNode }) {
  const { notify } = useToast();
  const copy = async () => {
    const text = value.startsWith('/') ? `${window.location.origin}${value}` : value;
    try {
      await navigator.clipboard.writeText(text);
      notify('Copiado al portapapeles ✓', 'success');
    } catch {
      notify('No se pudo copiar. Selecciónalo y cópialo a mano.', 'error');
    }
  };
  return (
    <button type="button" className="link" onClick={copy} aria-label={label}>
      {children ?? '⧉'}
    </button>
  );
}
