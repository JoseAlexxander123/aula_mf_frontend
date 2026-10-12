'use server';

import { ApiError } from '@/lib/http/errors';
import { cleanText, enforceLimit, limiters, runAction, type ActionResult } from '@/server/action-utils';
import { requireSession } from '@/server/auth/dal';
import { services } from '@/services';
import type { ChatMessage } from '@/types/domain';

const MAX_MESSAGE_LENGTH = 1000;

export async function sendMessageAction(text: string): Promise<ActionResult<ChatMessage>> {
  return runAction(async () => {
    const ctx = await requireSession('family');
    const clean = cleanText(text, MAX_MESSAGE_LENGTH);
    if (!clean) throw new ApiError('validation', 'Mensaje vacío', 400);
    enforceLimit(limiters.messages, ctx.user.id);
    return services.family.sendMessage(ctx, clean);
  });
}
