'use server';

import { ApiError } from '@/lib/http/errors';
import { cleanText, enforceLimit, limiters, runAction, type ActionResult } from '@/server/action-utils';
import { requireSession } from '@/server/auth/dal';
import { services } from '@/services';
import type { AnswerCheck, TutorMode, TutorReply } from '@/types/domain';

// Server Actions de la lección. Devuelven solo datos (sin re-render del servidor):
// el cliente actualiza su estado local → menos CPU en el VPS por cada clic.

const ID_RE = /^[\w-]{1,40}$/;
const TUTOR_MODES: TutorMode[] = ['hint', 'concept', 'plan', 'teacher', 'free'];
const MAX_QUESTION_LENGTH = 300;

const toCount = (n: unknown) => (Number.isInteger(n) && (n as number) >= 0 ? Math.min(n as number, 99) : 0);

function assertId(id: unknown): asserts id is string {
  if (typeof id !== 'string' || !ID_RE.test(id)) throw new ApiError('validation', 'Identificador inválido', 400);
}

export async function checkAnswerAction(exerciseId: string, answer: string, attempts: number, hintsUsed: number): Promise<ActionResult<AnswerCheck>> {
  return runAction(async () => {
    assertId(exerciseId);
    const ctx = await requireSession('student');
    enforceLimit(limiters.answers, ctx.user.id);
    return services.lessons.checkAnswer(ctx, exerciseId, cleanText(answer, 20), { attempts: toCount(attempts), hintsUsed: toCount(hintsUsed) });
  });
}

export async function askTutorAction(input: { exerciseId?: string; mode: TutorMode; message?: string; failedAttempts: number; hintsUsed: number }): Promise<ActionResult<TutorReply>> {
  return runAction(async () => {
    if (input.exerciseId !== undefined) assertId(input.exerciseId);
    if (!TUTOR_MODES.includes(input.mode)) throw new ApiError('validation', 'Modo inválido', 400);
    const ctx = await requireSession('student');
    enforceLimit(limiters.tutor, ctx.user.id);
    const message = cleanText(input.message, MAX_QUESTION_LENGTH);
    if (input.mode === 'free' && !message) throw new ApiError('validation', 'Pregunta vacía', 400);
    return services.tutor.ask(ctx, {
      exerciseId: input.exerciseId,
      mode: input.mode,
      message,
      failedAttempts: toCount(input.failedAttempts),
      hintsUsed: toCount(input.hintsUsed),
    });
  });
}
