import { Suspense } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { StatusSkeleton, StudentStatus } from '@/features/account/components/user-status';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      area="student"
      status={
        <Suspense fallback={<StatusSkeleton />}>
          <StudentStatus />
        </Suspense>
      }
    >
      {children}
    </AppShell>
  );
}
