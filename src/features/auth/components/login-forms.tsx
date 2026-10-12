'use client';

import { useActionState, useState } from 'react';
import { EyeIcon, EyeOffIcon } from '@/components/ui/icons';
import { Tabs } from '@/components/ui/tabs';
import { loginFamilyAction, loginStudentAction } from '../actions';
import styles from './login.module.css';

// Ingreso amigable para niños: usuario + 3 figuras secretas (6–11 años).
// Familia: correo + contraseña (funciona incluso antes de que cargue el JavaScript: Server Action directa).
// El límite de intentos lo aplica el servidor; aquí solo se muestra el mensaje.

const PICTOGRAMS = ['🦊', '🚀', '🍕', '🎮', '⭐', '🌈', '🐢', '🎨', '⚽'] as const;
const SECRET_LENGTH = 3;

export interface DemoCredentials {
  student: { username: string; pictograms: readonly string[] };
  family: { email: string; password: string };
}

interface Props {
  next?: string;
  expired?: boolean;
  demo?: DemoCredentials;
}

function StudentForm({ next, demo }: Pick<Props, 'next' | 'demo'>) {
  const [state, formAction, pending] = useActionState(loginStudentAction, {});
  const [secret, setSecret] = useState<string[]>([]);

  const toggle = (p: string) =>
    setSecret((current) => (current.length >= SECRET_LENGTH ? [p] : current.includes(p) ? current : [...current, p]));

  return (
    <form action={formAction} className={styles.form}>
      {next && <input type="hidden" name="next" value={next} />}
      <input type="hidden" name="pictograms" value={secret.join(',')} />
      <label className="label">
        Tu usuario
        <input className="input" name="username" autoComplete="username" placeholder="Ej.: valentina.r" required defaultValue={demo?.student.username} />
      </label>

      <div className={styles.secret}>
        <div className={styles.secretHead}>
          <span className="label" id="secret-label">Tu clave secreta</span>
          {secret.length > 0 && <button type="button" className="link" onClick={() => setSecret([])}>Borrar</button>}
        </div>
        <div className={styles.chosen} aria-live="polite" aria-label={`Elegiste ${secret.length} de ${SECRET_LENGTH} figuras`}>
          {Array.from({ length: SECRET_LENGTH }, (_, i) => (
            <span key={i} className={secret[i] ? styles.slotFull : styles.slot}>{secret[i] ?? ''}</span>
          ))}
        </div>
        <div className={styles.pictograms} role="group" aria-labelledby="secret-label">
          {PICTOGRAMS.map((p) => (
            <button key={p} type="button" aria-pressed={secret.includes(p)} onClick={() => toggle(p)} aria-label={`Figura ${p}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {state.error && <p className={styles.error} role="alert">{state.error}</p>}
      <button className="btn btn--primary btn--lg" type="submit" disabled={pending || secret.length !== SECRET_LENGTH}>
        {pending ? 'Entrando…' : 'Entrar a mi aula'}
      </button>
      <p className={styles.help}>Los alumnos de 6 a 11 años entran con figuras. Los de 12 a 17 pueden usar una contraseña.</p>
    </form>
  );
}

function FamilyForm({ next, demo }: Pick<Props, 'next' | 'demo'>) {
  const [state, formAction, pending] = useActionState(loginFamilyAction, {});
  const [visible, setVisible] = useState(false);
  return (
    <form action={formAction} className={styles.form}>
      {next && <input type="hidden" name="next" value={next} />}
      <label className="label">
        Correo de la familia
        <input className="input" name="email" type="email" autoComplete="email" placeholder="familia@correo.com" required defaultValue={demo?.family.email} />
      </label>
      <label className="label">
        Contraseña
        <span className={styles.passwordWrap}>
          <input className={`input ${styles.passwordInput}`} name="password" type={visible ? 'text' : 'password'} autoComplete="current-password" required />
          <button
            type="button"
            className={styles.reveal}
            onClick={() => setVisible((v) => !v)}
            aria-pressed={visible}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            title={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {visible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </span>
      </label>
      {state.error && <p className={styles.error} role="alert">{state.error}</p>}
      <button className="btn btn--primary btn--lg" type="submit" disabled={pending}>
        {pending ? 'Entrando…' : 'Entrar como familia'}
      </button>
      <p className={styles.help}>¿Primera vez? Usa el enlace que te enviamos por WhatsApp al matricular.</p>
    </form>
  );
}

export function LoginForms({ next, expired, demo }: Props) {
  const defaultTab = next?.startsWith('/familia') ? 'family' : 'student';
  return (
    <>
      {expired && <p className={styles.notice}>Tu sesión terminó. Vuelve a ingresar para continuar.</p>}
      <Tabs
        label="Tipo de cuenta"
        variant="segmented"
        defaultTab={defaultTab}
        items={[
          { id: 'student', label: 'Soy alumno', panel: <StudentForm next={next} demo={demo} /> },
          { id: 'family', label: 'Soy familia', panel: <FamilyForm next={next} demo={demo} /> },
        ]}
      />
      {demo && (
        <details className={styles.demo}>
          <summary>Datos de prueba (modo demo)</summary>
          <p>Alumno: <code>{demo.student.username}</code> + {demo.student.pictograms.join(' ')}</p>
          <p>Familia: <code>{demo.family.email}</code> / <code>{demo.family.password}</code></p>
        </details>
      )}
    </>
  );
}
