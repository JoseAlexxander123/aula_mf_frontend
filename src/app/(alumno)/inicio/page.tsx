import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { PageSkeleton, SectionTitle, Skeleton } from '@/components/ui/primitives';
import { TRACK_COLOR } from '@/config/areas';
import { ContinueCard } from '@/features/dashboard/components/continue-card';
import styles from '@/features/dashboard/components/dashboard.module.css';
import { MathLevels } from '@/features/learning/components/learning';
import { LiveClassesSection } from '@/features/schedule/components/schedule';
import { TaskList } from '@/features/schedule/components/task-list';
import { formatLongDate, greeting, relativeFromNow } from '@/lib/time';
import { requireSession } from '@/server/auth/dal';
import { services } from '@/services';

export const metadata: Metadata = { title: 'Inicio' };

const NOTICE_KIND = { review: 'Revisión', class: 'Clase', evaluation: 'Evaluación', message: 'Mensaje' } as const;

export default function DashboardPage() {
  return (
    <div className="page">
      <Suspense fallback={<><Skeleton height="3.5rem" /><PageSkeleton /></>}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}

async function DashboardContent() {
  const ctx = await requireSession('student');
  const d = await services.students.getDashboard(ctx);
  const tz = ctx.user.timeZone;
  const now = new Date(ctx.requestedAt);
  const mathCurrent = d.mathUnit.lessons.find((l) => l.status === 'current');
  const labCurrent = d.labUnit.lessons.find((l) => l.status === 'current');
  const mathDone = d.mathUnit.lessons.filter((l) => l.status === 'done').length;
  const pendingTasks = d.tasks.filter((t) => t.status === 'pending').length;

  return (
    <>
      <header className="page-header">
        <div>
          <h1>{greeting(now, tz)}, {d.profile.firstName}</h1>
          <p>
            {d.profile.grade} · {formatLongDate(now, tz)} · {d.classes.length} clases en vivo esta semana, {pendingTasks} tareas
            {d.pendingEvaluation ? ' y 1 evaluación pendiente' : ''}.
          </p>
        </div>
        <span className="pill">🔥 {d.profile.streakDays} días · ⭐ {d.profile.stars}</span>
      </header>

      <div className="grid-2">
        {mathCurrent && (
          <ContinueCard
            eyebrow={`Matemáticas · ${d.profile.math.level} · ${d.mathUnit.name}`}
            title={mathCurrent.title}
            progress={(mathDone / d.mathUnit.lessons.length) * 100}
            caption={`${mathDone} de ${d.mathUnit.lessons.length} lecciones`}
            href="/lecciones"
            cta="Continuar ▶"
            color={TRACK_COLOR.math}
            primary
          />
        )}
        {labCurrent && (
          <ContinueCard
            eyebrow={`Lab de ${d.profile.lab.month.toLowerCase()} · ${d.profile.lab.area} · ${labCurrent.label}`}
            title={labCurrent.title}
            progress={d.profile.lab.progress}
            caption={d.labUnit.name}
            href="/lecciones?ruta=lab"
            cta="Ir al lab"
            color={TRACK_COLOR.lab}
          />
        )}
      </div>

      <div className="split">
        <section className="section">
          <SectionTitle title="Esta semana" action={<Link className="link" href="/clases">Calendario →</Link>} />
          <LiveClassesSection classes={d.classes} timeZone={tz} now={ctx.requestedAt} />
          <SectionTitle title="Tareas" action={<Link className="link" href="/clases">Ver todas →</Link>} />
          <TaskList initial={d.tasks} />
        </section>

        <section className={`section ${styles.side}`}>
          <h2>Mi progreso</h2>
          <div className={`card ${styles.progressCard}`}>
            <div className={styles.progressHead}><b>Matemáticas</b><span>{d.profile.math.progress} % de {d.profile.math.level}</span></div>
            <MathLevels level={d.profile.math.level} startLevel={d.profile.math.startLevel} />
          </div>
          {d.pendingEvaluation && (
            <div className={`card ${styles.progressCard} ${styles.pendingCard}`}>
              <div className={styles.progressHead}><b>Evaluación pendiente</b><span>{d.pendingEvaluation.dateLabel}</span></div>
              <p>{d.pendingEvaluation.topic} · {d.pendingEvaluation.resultLabel}</p>
              <Link className="btn btn--primary" href="/evaluaciones">Rendir evaluación</Link>
            </div>
          )}
          {d.recentScores.length > 0 && (
            <div className={`card ${styles.progressCard}`}>
              <div className={styles.progressHead}><b>Últimas notas</b><span>semanales</span></div>
              <p className="small">{d.recentScores.map((s) => `${s.topic} ${s.score} %`).join(' · ')}</p>
            </div>
          )}
          <h2>Avisos</h2>
          <ul role="list" className={styles.notices}>
            {d.notifications.map((n) => (
              <li key={n.id}>
                <span className={styles.noticeKind}>{NOTICE_KIND[n.kind]}</span>
                <div>
                  {n.href ? <Link href={n.href}><b>{n.title}</b></Link> : <b>{n.title}</b>}
                  <small>{n.detail} · {relativeFromNow(n.createdAt, ctx.requestedAt)}</small>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
