import { Tabs } from '@/components/ui/tabs';
import { TRACK_COLOR } from '@/config/areas';
import { LessonList } from '@/features/learning/components/learning';
import { SubmissionForm } from '@/features/schedule/components/submission-form';
import type { LabLessonDetail, MathLessonDetail, Unit } from '@/types/domain';
import styles from './lesson.module.css';
import { MaterialsList } from './materials';
import { Practice } from './practice';
import { VideoPlayer } from './video-player';

// Composición de la lección (Server Component). Solo las piezas interactivas
// (pestañas, video, práctica, entrega) envían JavaScript al navegador.

export function MathLessonPanel({ lesson, unit }: { lesson: MathLessonDetail; unit: Unit }) {
  return (
    <>
      <header className={styles.head}>
        <small>{lesson.unitLabel} · {lesson.position}</small>
        <h2>{lesson.title}</h2>
      </header>
      <Tabs
        label="Contenido de la lección"
        variant="folder"
        items={[
          { id: 'clase', label: '1 · Clase grabada', panel: <VideoPlayer recording={lesson.recording} /> },
          { id: 'practica', label: '2 · Práctica', panel: <Practice exercises={lesson.exercises} /> },
          { id: 'materiales', label: 'Materiales', panel: <MaterialsList materials={lesson.materials} /> },
        ]}
      />
      <section className="section">
        <h3>Temario de la unidad</h3>
        <LessonList lessons={unit.lessons} color={TRACK_COLOR.math} />
      </section>
    </>
  );
}

export function LabLessonPanel({ lesson, unit }: { lesson: LabLessonDetail; unit: Unit }) {
  return (
    <>
      <header className={styles.head}>
        <small>{lesson.unitLabel}</small>
        <h2>{lesson.title}</h2>
      </header>
      <VideoPlayer recording={lesson.recording} />
      <section className="card">
        <h3>Reto de la semana</h3>
        <ol className={styles.challenge}>{lesson.challenge.map((step) => <li key={step}>{step}</li>)}</ol>
      </section>
      <section className="card section">
        <h3>Materiales</h3>
        <MaterialsList materials={lesson.materials} />
      </section>
      <SubmissionForm taskId={lesson.taskId} successText="¡Entregado! El Prof. Diego lo revisará antes de la clase del miércoles." />
      <section className="section">
        <h3>Temario del laboratorio</h3>
        <LessonList lessons={unit.lessons} color={TRACK_COLOR.lab} href="/lecciones?ruta=lab" />
      </section>
    </>
  );
}

export function TrackLabel({ title, detail }: { title: string; detail: string }) {
  return (
    <>
      <span>{title}</span>
      <small>{detail}</small>
    </>
  );
}

export const trackTabClass = { math: `${styles.trackTab} ${styles.trackMath}`, lab: `${styles.trackTab} ${styles.trackLab}` };
