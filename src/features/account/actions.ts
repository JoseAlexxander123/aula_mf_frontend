'use server';

import { runAction, type ActionResult } from '@/server/action-utils';
import { requireSession } from '@/server/auth/dal';
import { services } from '@/services';

export async function markNotificationsReadAction(): Promise<ActionResult<null>> {
  return runAction(async () => {
    const ctx = await requireSession();
    await services.notifications.markAllRead(ctx);
    return null;
  });
}
