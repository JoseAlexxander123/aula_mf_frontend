import { Suspense } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { FamilyStatus, StatusSkeleton } from '@/features/account/components/user-status';

export default function FamilyLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      area="family"
      status={
        <Suspense fallback={<StatusSkeleton />}>
          <FamilyStatus />
        </Suspense>
      }
    >
      {children}
    </AppShell>
  );
}
