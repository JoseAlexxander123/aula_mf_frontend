'use server';

import { ApiError } from '@/lib/http/errors';
import { cleanText, enforceLimit, limiters, runAction, type ActionResult } from '@/server/action-utils';
import { requireSession } from '@/server/auth/dal';
import { services } from '@/services';
import type { Task } from '@/types/domain';

const MAX_FILES = 5;

export async function submitTaskAction(taskId: string, note: string, fileNames: string[]): Promise<ActionResult<Task>> {
  return runAction(async () => {
    if (typeof taskId !== 'string' || !/^[\w-]{1,40}$/.test(taskId)) throw new ApiError('validation', 'Tarea inválida', 400);
    const ctx = await requireSession('student');
    enforceLimit(limiters.submissions, ctx.user.id);
    const files = (Array.isArray(fileNames) ? fileNames : []).slice(0, MAX_FILES).map((f) => cleanText(f, 120)).filter(Boolean);
    return services.schedule.submitTask(ctx, taskId, { note: cleanText(note, 500), fileNames: files });
  });
}
