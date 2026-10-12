'use client';

/** «Descargar informe PDF»: usa el diálogo de impresión del navegador (Guardar como PDF), sin librerías. */
export function PrintButton() {
  return (
    <button type="button" className="btn no-print" onClick={() => window.print()}>
      Descargar informe PDF
    </button>
  );
}
