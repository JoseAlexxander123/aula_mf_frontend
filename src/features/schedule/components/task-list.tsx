'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import type { Task } from '@/types/domain';
import styles from './schedule.module.css';
import { SubmissionForm } from './submission-form';

// Tareas y entregas. «Entregar» abre el formulario en la misma tarjeta (sin cambiar de página)
// y el estado se actualiza con la respuesta del servidor.

const STATUS_LABEL = { pending: 'Pendiente', submitted: 'Entregada', reviewed: 'Revisada' } as const;

export function TaskList({ initial }: { initial: Task[] }) {
  const [tasks, setTasks] = useState(initial);
  const [openId, setOpenId] = useState<string | null>(null);

  const update = (task: Task) => {
    setTasks((list) => list.map((t) => (t.id === task.id ? task : t)));
    setOpenId(null);
  };

  return (
    <ul role="list" className={styles.tasks}>
      {tasks.map((t) => (
        <li key={t.id} className={cn(styles.task, styles[`task_${t.status}`])}>
          <span className={styles.taskStatus}>{STATUS_LABEL[t.status]}</span>
          <div className={styles.taskText}>
            <b>{t.title}</b>
            <small>{t.course} · {t.status === 'pending' ? `Vence: ${t.dueLabel}` : t.dueLabel}</small>
            {t.teacherComment && <p className={styles.taskComment}>💬 {t.teacherComment}</p>}
            {openId === t.id && <SubmissionForm taskId={t.id} compact onSubmitted={update} />}
          </div>
          {t.status === 'pending' && (
            <button type="button" className="link" onClick={() => setOpenId(openId === t.id ? null : t.id)} aria-expanded={openId === t.id}>
              {openId === t.id ? 'Cancelar' : 'Entregar'}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
