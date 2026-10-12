'use client';

import { useOptimistic, useRef, useState, useTransition, type FormEvent } from 'react';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/cn';
import { sendMessageAction } from '../actions';
import styles from './family.module.css';

// Mensajes con los profesores. El mensaje aparece al instante (useOptimistic) y se confirma
// con la respuesta del servidor; si falla, se retira y se avisa.

export interface MessageView {
  id: string;
  author: 'teacher' | 'family';
  authorName: string;
  text: string;
  timeLabel: string;
  pending?: boolean;
}

export function MessageThread({ initial }: { initial: MessageView[] }) {
  const { notify } = useToast();
  const [messages, setMessages] = useState(initial);
  const [optimistic, addOptimistic] = useOptimistic(messages, (list, m: MessageView) => [...list, m]);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const send = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = inputRef.current?.value.trim() ?? '';
    if (!text || pending) return;
    if (inputRef.current) inputRef.current.value = '';

    startTransition(async () => {
      addOptimistic({ id: `tmp-${Date.now()}`, author: 'family', authorName: 'Tú', text, timeLabel: 'Enviando…', pending: true });
      const result = await sendMessageAction(text);
      if (!result.ok) {
        notify(result.error, 'error');
        if (inputRef.current) inputRef.current.value = text;
        return;
      }
      const m = result.data;
      setMessages((list) => [...list, { id: m.id, author: m.author, authorName: m.authorName, text: m.text, timeLabel: 'Ahora' }]);
    });
  };

  return (
    <article className={styles.cardF}>
      <h3>Mensajes con los profesores</h3>
      <div className={styles.thread} aria-live="polite">
        {optimistic.map((m) => (
          <p key={m.id} className={cn(m.author === 'teacher' ? styles.msgTeacher : styles.msgFamily, m.pending && styles.msgPending)}>
            {m.author === 'teacher' && <b>{m.authorName}: </b>}
            {m.text}
            <small>{m.timeLabel}</small>
          </p>
        ))}
      </div>
      <form className={styles.compose} onSubmit={send}>
        <label className="visually-hidden" htmlFor="msg-teacher">Escribe un mensaje</label>
        <input ref={inputRef} id="msg-teacher" placeholder="Escribe a la profesora…" maxLength={1000} autoComplete="off" />
        <button type="submit" disabled={pending}>Enviar</button>
      </form>
    </article>
  );
}
