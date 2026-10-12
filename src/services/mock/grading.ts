// Corrección del modo mock (en producción la hace la API .NET). Funciones puras → fáciles de probar.

import { areEquivalent, formatFraction, isSimplified, parseFraction, simplify, type Fraction } from '@/lib/math/fractions';
import type { AnswerCheck, QuizAnswers, QuizResult } from '@/types/domain';
import type { QuizKey } from './data';

/** Estrellas: 3 al primer intento sin pistas; −1 por cada intento extra o pista; mínimo 1. */
export function starsFor(attempts: number, hintsUsed: number): number {
  return Math.max(1, 3 - Math.max(0, attempts - 1) - hintsUsed);
}

export function checkFractionAnswer(raw: string, expected: Fraction, attempts: number, hintsUsed: number): AnswerCheck {
  const parsed = parseFraction(raw);
  if (!parsed) {
    return { correct: false, feedback: 'Escribe tu respuesta como fracción, por ejemplo 3/4.', starsEarned: 0, countsAsAttempt: false };
  }
  if (!areEquivalent(parsed, expected)) {
    return {
      correct: false,
      feedback: attempts >= 2
        ? 'Todavía no. Pídele una pista al tutor: te ayuda sin darte la respuesta.'
        : 'Todavía no. Revisa si los denominadores son iguales antes de sumar.',
      starsEarned: 0,
      countsAsAttempt: true,
    };
  }
  const stars = starsFor(attempts, hintsUsed);
  const simplifyTip = isSimplified(parsed) ? '' : ` Puedes simplificarla: ${formatFraction(simplify(parsed))}.`;
  return { correct: true, feedback: `¡Correcto! +${stars} ⭐${simplifyTip}`, starsEarned: stars, countsAsAttempt: true };
}

function isQuestionCorrect(q: QuizKey, raw: string | undefined): boolean {
  const value = (raw ?? '').trim();
  if (!value) return false;
  if (q.type === 'choice') return value === q.answer;
  if (q.type === 'number') return Number(value.replace(',', '.')) === Number(q.answer);
  const given = parseFraction(value);
  const expected = parseFraction(q.answer);
  return !!given && !!expected && areEquivalent(given, expected);
}

export function gradeQuiz(questions: QuizKey[], answers: QuizAnswers, late: boolean): QuizResult {
  const byCompetency = new Map<string, { correct: number; total: number }>();
  const results = questions.map((q) => {
    const correct = isQuestionCorrect(q, answers[q.id]);
    const c = byCompetency.get(q.competency) ?? { correct: 0, total: 0 };
    c.total++;
    if (correct) c.correct++;
    byCompetency.set(q.competency, c);
    return { questionId: q.id, correct, explanation: q.explanation };
  });

  const correctCount = results.filter((r) => r.correct).length;
  const ratio = questions.length ? correctCount / questions.length : 0;
  return {
    score: Math.round(ratio * 100),
    correctCount,
    total: questions.length,
    points: Math.round(ratio * 20),
    byCompetency: [...byCompetency].map(([competency, v]) => ({ competency, ...v })),
    questions: results,
    late,
  };
}
