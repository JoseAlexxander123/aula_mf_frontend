'use client';

import { createContext, use, useState, type ReactNode } from 'react';

// Canal entre la práctica, el tutor y las evaluaciones de una misma pantalla
// (equivale a los CustomEvent del prototipo, pero tipado y sin tocar `document`).
//
// - Los contadores (intentos fallidos, pistas) viven en un objeto mutable: leerlos no re-renderiza nada.
// - Los eventos avisan a quien esté suscrito (el tutor), que decide si actualiza su UI.

export type StudyEvent =
  | { type: 'exercise-active'; exerciseId: string }
  | { type: 'hint-requested'; exerciseId: string; prompt: string }
  | { type: 'attempt-failed'; exerciseId: string; failedAttempts: number }
  | { type: 'solved'; exerciseId: string; stars: number }
  | { type: 'evaluation-started' }
  | { type: 'evaluation-finished'; score: number };

interface ExerciseStats {
  failed: number;
  hints: number;
}

export interface StudySession {
  emit(event: StudyEvent): void;
  subscribe(listener: (event: StudyEvent) => void): () => void;
  stats(exerciseId: string): ExerciseStats;
  addHint(exerciseId: string): void;
  addFailure(exerciseId: string): number;
}

function createStudySession(): StudySession {
  const listeners = new Set<(event: StudyEvent) => void>();
  const stats = new Map<string, ExerciseStats>();
  const get = (id: string) => {
    let s = stats.get(id);
    if (!s) stats.set(id, (s = { failed: 0, hints: 0 }));
    return s;
  };
  return {
    emit: (event) => listeners.forEach((l) => l(event)),
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    stats: (id) => ({ ...get(id) }),
    addHint: (id) => void get(id).hints++,
    addFailure: (id) => ++get(id).failed,
  };
}

const StudySessionContext = createContext<StudySession | null>(null);

export function StudySessionProvider({ children }: { children: ReactNode }) {
  const [session] = useState(createStudySession);
  return <StudySessionContext value={session}>{children}</StudySessionContext>;
}

export function useStudySession(): StudySession {
  const session = use(StudySessionContext);
  if (!session) throw new Error('useStudySession debe usarse dentro de <StudySessionProvider>');
  return session;
}
