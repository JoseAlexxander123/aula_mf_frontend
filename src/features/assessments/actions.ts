'use server';

import { ApiError } from '@/lib/http/errors';
import { cleanText, enforceLimit, limiters, runAction, type ActionResult } from '@/server/action-utils';
import { requireSession } from '@/server/auth/dal';
import { services } from '@/services';
import type { QuizAnswers, QuizAttempt, QuizResult } from '@/types/domain';

const ID_RE = /^[\w-]{1,64}$/;
const MAX_ANSWERS = 50;

/** Inicia el intento. Devuelve también la hora del servidor para que el reloj del navegador no mande. */
export async function startEvaluationAction(evaluationId: string): Promise<ActionResult<{ attempt: QuizAttempt; serverNow: number }>> {
  return runAction(async () => {
    if (!ID_RE.test(String(evaluationId))) throw new ApiError('validation', 'Evaluación inválida', 400);
    const ctx = await requireSession('student');
    enforceLimit(limiters.submissions, ctx.user.id);
    const attempt = await services.assessments.start(ctx, evaluationId);
    return { attempt, serverNow: Date.now() };
  });
}

export async function submitEvaluationAction(attemptId: string, answers: QuizAnswers): Promise<ActionResult<QuizResult>> {
  return runAction(async () => {
    if (!ID_RE.test(String(attemptId))) throw new ApiError('validation', 'Intento inválido', 400);
    const ctx = await requireSession('student');
    const clean: QuizAnswers = {};
    for (const [key, value] of Object.entries(answers ?? {}).slice(0, MAX_ANSWERS)) {
      if (ID_RE.test(key)) clean[key] = cleanText(value, 40);
    }
    return services.assessments.submit(ctx, attemptId, clean);
  });
}
