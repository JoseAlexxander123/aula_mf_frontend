import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getSession } from '@/server/auth/dal';
import { HOME_BY_ROLE, LOGIN_PATH } from '@/server/auth/constants';

// Normalmente proxy.ts redirige «/» antes de llegar aquí; esto es el respaldo.
export default function RootPage() {
  return (
    <Suspense>
      <RedirectHome />
    </Suspense>
  );
}

async function RedirectHome(): Promise<null> {
  const session = await getSession();
  redirect(session ? HOME_BY_ROLE[session.user.role] : LOGIN_PATH);
}
