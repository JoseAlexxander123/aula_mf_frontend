'use client';

import { useRef, useState, useTransition, type FormEvent } from 'react';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/cn';
import type { PracticeExercise } from '@/types/domain';
import { addStars } from '@/features/account/stars-store';
import { checkAnswerAction } from '../actions';
import { useStudySession } from '../study-session';
import styles from './practice.module.css';

// Práctica con corrección inmediata. La respuesta se corrige en el servidor (el navegador no la conoce).
// Acepta fracciones equivalentes; estrellas: 3 al primer intento sin pistas, menos por intento/pista.

interface ExerciseUi {
  attempts: number;
  status: 'idle' | 'wrong' | 'right';
  feedback: string;
}

const STARS_PER_EXERCISE = 3;

export function Practice({ exercises, title = 'Practica lo aprendido' }: { exercises: PracticeExercise[]; title?: string }) {
  const session = useStudySession();
  const { notify } = useToast();
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [stars, setStars] = useState(0);
  const [ui, setUi] = useState<Record<string, ExerciseUi>>({});
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const exercise = exercises[index];
  const current = ui[exercise?.id] ?? { attempts: 0, status: 'idle', feedback: '' };
  const patch = (id: string, value: Partial<ExerciseUi>) =>
    setUi((all) => ({ ...all, [id]: { ...(all[id] ?? { attempts: 0, status: 'idle', feedback: '' }), ...value } }));

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const answer = inputRef.current?.value.trim() ?? '';
    if (!answer || pending || current.status === 'right') return;
    const attempts = current.attempts + 1;
    const { hints } = session.stats(exercise.id);

    startTransition(async () => {
      const result = await checkAnswerAction(exercise.id, answer, attempts, hints);
      if (!result.ok) {
        notify(result.error, 'error');
        return;
      }
      const check = result.data;
      patch(exercise.id, {
        attempts: check.countsAsAttempt ? attempts : current.attempts, // un formato inválido no cuenta
        status: check.correct ? 'right' : 'wrong',
        feedback: check.feedback,
      });

      if (check.correct) {
        setStars((s) => s + check.starsEarned);
        addStars(check.starsEarned);
        session.emit({ type: 'solved', exerciseId: exercise.id, stars: check.starsEarned });
        requestAnimationFrame(() => nextRef.current?.focus());
      } else if (check.countsAsAttempt) {
        session.emit({ type: 'attempt-failed', exerciseId: exercise.id, failedAttempts: session.addFailure(exercise.id) });
      }
    });
  };

  const goNext = () => {
    if (index + 1 >= exercises.length) {
      setFinished(true);
      return;
    }
    const next = exercises[index + 1];
    setIndex(index + 1);
    session.emit({ type: 'exercise-active', exerciseId: next.id });
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <section className={styles.practice} aria-labelledby="practice-title">
      <header className={styles.head}>
        <h3 id="practice-title">{title}</h3>
        <p className={styles.stars} aria-live="polite">{stars} / {exercises.length * STARS_PER_EXERCISE} ⭐</p>
      </header>

      <ol role="list" className={styles.steps} aria-label="Progreso de la práctica">
        {exercises.map((e, i) => (
          <li key={e.id} className={cn(ui[e.id]?.status === 'right' && styles.stepDone, i === index && !finished && styles.stepCurrent)}>
            <span className="visually-hidden">Ejercicio {i + 1}{ui[e.id]?.status === 'right' ? ', resuelto' : ''}</span>
          </li>
        ))}
      </ol>

      {finished ? (
        <div className={styles.done}>
          <p className={styles.doneTitle}>¡Práctica terminada! 🎉</p>
          <p>Ganaste <b>{stars}</b> estrellas. Tu profesora verá tu avance antes de la próxima clase.</p>
        </div>
      ) : (
        <form key={exercise.id} className={cn(styles.exercise, current.status === 'right' && styles.right, current.status === 'wrong' && styles.wrong)} onSubmit={submit} noValidate>
          <p className={styles.num}>Ejercicio {index + 1} de {exercises.length}</p>
          <p className={styles.prompt}>{exercise.prompt}</p>
          <div className={styles.row}>
            <label className="visually-hidden" htmlFor={`answer-${exercise.id}`}>Tu respuesta</label>
            <input
              ref={inputRef}
              id={`answer-${exercise.id}`}
              className={styles.input}
              autoComplete="off"
              inputMode="text"
              placeholder="Ej.: 3/4"
              maxLength={20}
              disabled={current.status === 'right'}
              onInput={() => current.status === 'wrong' && patch(exercise.id, { status: 'idle' })}
            />
            <button type="submit" className={styles.check} disabled={pending || current.status === 'right'}>
              {pending ? 'Revisando…' : 'Comprobar'}
            </button>
            <button
              type="button"
              className={styles.hint}
              disabled={current.status === 'right'}
              onClick={() => session.emit({ type: 'hint-requested', exerciseId: exercise.id, prompt: exercise.prompt })}
            >
              Pedir pista
            </button>
          </div>
          <p className={styles.feedback} aria-live="polite">{current.feedback}</p>
          {current.status === 'right' && (
            <button ref={nextRef} type="button" className={styles.next} onClick={goNext}>
              {index < exercises.length - 1 ? 'Siguiente ejercicio →' : 'Terminar práctica'}
            </button>
          )}
        </form>
      )}
    </section>
  );
}
