'use client';

import { useEffect, useEffectEvent, useRef, useState, useTransition, type FormEvent } from 'react';
import { useCooldown } from '@/hooks/use-cooldown';
import { cn } from '@/lib/cn';
import type { TutorMode } from '@/types/domain';
import { askTutorAction } from '../actions';
import { useStudySession, type StudyEvent } from '../study-session';
import styles from './tutor.module.css';

// Tutor IA «Profe Fácil». Reglas visibles para el alumno y la familia:
// no da respuestas ni hace tareas; pistas de a una; plan paso a paso tras 2 intentos;
// escala al profesor; se pausa durante las evaluaciones.

interface Message { id: number; from: 'tutor' | 'student'; text: string }

const PLAN_UNLOCK_ATTEMPTS = 2;
const MAX_MESSAGES = 40; // tope de mensajes en pantalla: memoria y DOM acotados
const COOLDOWN_MS = 1200;

const QUICK_ACTIONS: { mode: Exclude<TutorMode, 'free'>; label: string }[] = [
  { mode: 'hint', label: '💡 Pista' },
  { mode: 'concept', label: '📘 Explícame la idea' },
  { mode: 'plan', label: '🧩 Plan paso a paso' },
  { mode: 'teacher', label: '🙋 Preguntar a mi profesor' },
];

interface Props {
  studentName: string;
  defaultExerciseId?: string;
  greeting?: string;
}

export function Tutor({ studentName, defaultExerciseId, greeting }: Props) {
  const session = useStudySession();
  const [messages, setMessages] = useState<Message[]>(() => [
    { id: 0, from: 'tutor', text: greeting ?? `¡Hola, ${studentName}! Soy Profe Fácil. Te ayudo a pensar, no a copiar. Pregúntame lo que no entiendas.` },
  ]);
  const [exerciseId, setExerciseId] = useState(defaultExerciseId);
  const [failedByExercise, setFailedByExercise] = useState<Record<string, number>>({});
  const [paused, setPaused] = useState(false);
  const [pending, startTransition] = useTransition();
  const { locked, lock } = useCooldown(COOLDOWN_MS);
  const chatRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);
  const inputRef = useRef<HTMLInputElement>(null);

  const say = (from: Message['from'], text: string) =>
    setMessages((list) => [...list.slice(-(MAX_MESSAGES - 1)), { id: nextId.current++, from, text }]);

  const ask = (mode: TutorMode, targetId = exerciseId, message?: string) => {
    if (pending || locked || paused) return;
    lock();
    const { failed, hints } = targetId ? session.stats(targetId) : { failed: 0, hints: 0 };
    startTransition(async () => {
      const result = await askTutorAction({ exerciseId: targetId, mode, message, failedAttempts: failed, hintsUsed: hints });
      if (!result.ok) {
        say('tutor', result.error);
        if (result.retryAfterSec) lock(result.retryAfterSec * 1000);
        return;
      }
      if (result.data.countsAsHint && targetId) session.addHint(targetId);
      say('tutor', result.data.text);
    });
  };

  // Escucha lo que pasa en la práctica y en las evaluaciones de la misma pantalla.
  const onStudyEvent = useEffectEvent((event: StudyEvent) => {
    switch (event.type) {
      case 'exercise-active':
        setExerciseId(event.exerciseId);
        break;
      case 'hint-requested':
        setExerciseId(event.exerciseId);
        say('student', `Necesito ayuda con: ${event.prompt}`);
        ask('hint', event.exerciseId);
        break;
      case 'attempt-failed':
        setExerciseId(event.exerciseId);
        setFailedByExercise((m) => ({ ...m, [event.exerciseId]: event.failedAttempts }));
        if (event.failedAttempts === PLAN_UNLOCK_ATTEMPTS) say('tutor', 'Lo intentaste 2 veces: ya puedes abrir el 🧩 plan paso a paso si lo necesitas.');
        break;
      case 'solved':
        if (event.stars === 3) say('tutor', '¡Lo resolviste sin ayuda! Eso es pensar como matemática. 🎉');
        break;
      case 'evaluation-started':
        setPaused(true);
        say('tutor', 'Estás en una evaluación: me pongo en pausa hasta que termines. ¡Tú puedes!');
        break;
      case 'evaluation-finished':
        setPaused(false);
        say('tutor', `¡Terminaste con ${event.score} %! Si quieres, repasamos juntas las preguntas que fallaste.`);
        break;
    }
  });
  useEffect(() => session.subscribe((event) => onStudyEvent(event)), [session]);

  // Desplaza el chat al último mensaje (solo cuando cambia la lista).
  useEffect(() => {
    const el = chatRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, pending]);

  const planOpen = !!exerciseId && (failedByExercise[exerciseId] ?? 0) >= PLAN_UNLOCK_ATTEMPTS;
  const inactive = paused;

  const onQuick = (mode: Exclude<TutorMode, 'free'>, label: string) => {
    say('student', label.replace(/^\S+\s/, ''));
    ask(mode);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = inputRef.current?.value.trim() ?? '';
    if (!text) return;
    say('student', text);
    if (inputRef.current) inputRef.current.value = '';
    ask('free', exerciseId, text);
  };

  return (
    <aside className={cn(styles.tutor, inactive && styles.paused)} aria-label="Tutor IA Profe Fácil">
      <header className={styles.head}>
        <span className={styles.avatar} aria-hidden="true">✦</span>
        <div>
          <b>Profe Fácil</b>
          <small>{paused ? 'En pausa durante la evaluación' : 'Tutor IA · te ayuda a pensar, no hace tareas'}</small>
        </div>
      </header>

      <details className={styles.rules}>
        <summary>Mis reglas</summary>
        <ul>
          <li>No te doy la respuesta ni hago tus tareas o evaluaciones.</li>
          <li>Te hago preguntas y te doy pistas, de a una.</li>
          <li>El plan paso a paso se abre si lo intentaste 2 veces o si tu profe lo activa.</li>
          <li>Si la duda es difícil, se la paso a tu profesor.</li>
          <li>Tus papás pueden ver de qué temas preguntaste.</li>
        </ul>
      </details>

      <div ref={chatRef} className={styles.chat} aria-live="polite">
        {messages.map((m) => (
          <p key={m.id} className={m.from === 'tutor' ? styles.msgTutor : styles.msgStudent}>{m.text}</p>
        ))}
        {pending && <p className={cn(styles.msgTutor, styles.typing)}>Profe Fácil está pensando…</p>}
      </div>

      <div className={styles.quick} role="group" aria-label="Ayudas">
        {QUICK_ACTIONS.map(({ mode, label }) => (
          <button
            key={mode}
            type="button"
            className={cn(mode === 'plan' && !planOpen && styles.lockedBtn)}
            disabled={inactive || pending || locked}
            onClick={() => onQuick(mode, label)}
          >
            {label}
            {mode === 'plan' && !planOpen && <span aria-label="bloqueado"> 🔒</span>}
          </button>
        ))}
      </div>

      <form className={styles.form} onSubmit={onSubmit}>
        <label className="visually-hidden" htmlFor="tutor-question">Escribe tu pregunta</label>
        <input ref={inputRef} id="tutor-question" autoComplete="off" placeholder="Escribe tu duda…" maxLength={300} disabled={inactive} />
        <button type="submit" disabled={inactive || pending || locked}>Enviar</button>
      </form>
      <p className={styles.note}>Las conversaciones se guardan para que tu profesor y tu familia vean los temas consultados.</p>
    </aside>
  );
}
