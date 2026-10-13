import { Skeleton } from '@/components/ui/primitives';
import { requireSession } from '@/server/auth/dal';
import { services } from '@/services';
import { NotificationsBell, StarsChip, UserMenu } from './header-widgets';
import styles from './header.module.css';

// Parte de la cabecera que depende de la sesión. Va dentro de <Suspense> en el layout.

export function StatusSkeleton() {
  return <Skeleton height="2.4rem" className={styles.hideMobile} />;
}

export async function StudentStatus() {
  const ctx = await requireSession('student');
  const [profile, notifications] = await Promise.all([services.students.getProfile(ctx), services.notifications.list(ctx)]);
  return (
    <>
      <span className={`chip ${styles.headChip} ${styles.hideMobile}`} title="Días seguidos practicando">🔥 {profile.streakDays}</span>
      <StarsChip initial={profile.stars} />
      <NotificationsBell items={notifications} serverNow={ctx.requestedAt} />
      <UserMenu name={profile.firstName} avatar={profile.avatar} subtitle={profile.grade} />
    </>
  );
}

export async function FamilyStatus() {
  const ctx = await requireSession('family');
  const notifications = await services.notifications.list(ctx);
  const initials = ctx.user.displayName.replace('Familia ', '').slice(0, 2).toUpperCase();
  return (
    <>
      <NotificationsBell items={notifications} serverNow={ctx.requestedAt} />
      <UserMenu name={ctx.user.displayName} avatar={initials} subtitle="Cuenta familiar" textAvatar />
    </>
  );
}
