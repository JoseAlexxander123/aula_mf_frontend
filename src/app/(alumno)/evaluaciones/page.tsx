import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageHeader, PageSkeleton } from '@/components/ui/primitives';
import { EvaluationsBoard } from '@/features/assessments/components/evaluations-board';
import { Tutor } from '@/features/lessons/components/tutor';
import { StudySessionProvider } from '@/features/lessons/study-session';
import { requireSession } from '@/server/auth/dal';
import { services } from '@/services';

export const metadata: Metadata = { title: 'Evaluaciones' };

export default function EvaluationsPage() {
  return (
    <div className="page">
      <PageHeader title="Evaluaciones" description="Prueba de entrada, evaluaciones semanales con calificación automática y proyectos del laboratorio." />
      <Suspense fallback={<PageSkeleton />}>
        <EvaluationsContent />
      </Suspense>
    </div>
  );
}

async function EvaluationsContent() {
  const ctx = await requireSession('student');
  const [evaluations, profile] = await Promise.all([services.assessments.list(ctx), services.students.getProfile(ctx)]);
  return (
    <StudySessionProvider>
      <div className="split-aside">
        <EvaluationsBoard initial={evaluations} startLevel={profile.math.startLevel} currentLevel={profile.math.level} />
        <Tutor
          studentName={profile.firstName}
          greeting="Durante las evaluaciones me pongo en pausa. Cuando termines, repasamos las preguntas que fallaste."
        />
      </div>
    </StudySessionProvider>
  );
}
