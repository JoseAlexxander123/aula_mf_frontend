'use client';

import { useId, useState, useTransition, type FormEvent } from 'react';
import { useToast } from '@/components/ui/toast';
import type { Task } from '@/types/domain';
import { submitTaskAction } from '../actions';
import styles from './schedule.module.css';

// Entrega de avance (videos o capturas). Se valida en el navegador antes de enviar
// para no gastar ancho de banda ni CPU del servidor con archivos que se rechazarán.

const MAX_FILES = 5;
const MAX_FILE_MB = 50;

interface Props {
  taskId: string;
  title?: string;
  successText?: string;
  onSubmitted?: (task: Task) => void;
  compact?: boolean;
}

export function SubmissionForm({ taskId, title = 'Entrega tu avance', successText = '¡Entregado! Tu profesor lo revisará antes de la próxima clase.', onSubmitted, compact }: Props) {
  const id = useId();
  const { notify } = useToast();
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const files = Array.from((form.elements.namedItem('files') as HTMLInputElement).files ?? []);
    const note = (form.elements.namedItem('note') as HTMLInputElement).value;

    if (files.length === 0 && !note.trim()) return setError('Sube al menos un archivo o cuéntanos qué hiciste.');
    if (files.length > MAX_FILES) return setError(`Puedes subir hasta ${MAX_FILES} archivos.`);
    const tooBig = files.find((f) => f.size > MAX_FILE_MB * 1024 * 1024);
    if (tooBig) return setError(`«${tooBig.name}» pesa más de ${MAX_FILE_MB} MB.`);
    setError('');

    startTransition(async () => {
      const result = await submitTaskAction(taskId, note, files.map((f) => f.name));
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDone(true);
      notify('Entrega enviada ✓', 'success');
      onSubmitted?.(result.data);
    });
  };

  if (done) return <p className={styles.ok} role="status">✓ {successText}</p>;

  return (
    <form className={compact ? styles.submissionCompact : `card ${styles.submission}`} onSubmit={submit} noValidate>
      {!compact && <h3>{title}</h3>}
      <label className="label" htmlFor={`${id}-files`}>Sube tu video o capturas</label>
      <input id={`${id}-files`} name="files" type="file" accept="image/*,video/*" multiple className="input" />
      <label className="label" htmlFor={`${id}-note`}>¿Qué hiciste? (opcional)</label>
      <input id={`${id}-note`} name="note" className="input" maxLength={500} placeholder="Ej.: puse los checkpoints antes de cada salto" />
      {error && <p className={styles.error} role="alert">{error}</p>}
      <button className="btn btn--primary" type="submit" disabled={pending}>{pending ? 'Enviando…' : 'Entregar'}</button>
    </form>
  );
}
