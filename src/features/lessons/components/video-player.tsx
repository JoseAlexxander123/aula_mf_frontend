'use client';

import { useEffect, useRef, useState } from 'react';
import { formatClock } from '@/lib/time';
import type { Recording } from '@/types/domain';
import styles from './video.module.css';

// Grabación de la clase con capítulos.
// - Con `src`: <video preload="none"> → no descarga nada hasta que el alumno da play (ahorra datos y CPU).
// - Sin `src` (demo): marcador que simula la reproducción con un solo temporizador de 1 s.
// En producción el backend entregará la URL de Vimeo/Bunny/Mux con los mismos capítulos.

export function VideoPlayer({ recording }: { recording: Recording }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [position, setPosition] = useState(0);
  const [playing, setPlaying] = useState(false);
  const positionRef = useRef(0);
  const total = recording.durationSec;

  // Simulación solo en modo demo y solo mientras «reproduce».
  useEffect(() => {
    if (recording.src || !playing) return;
    const timer = window.setInterval(() => {
      positionRef.current = Math.min(total, positionRef.current + 1);
      setPosition(positionRef.current);
      if (positionRef.current >= total) setPlaying(false);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [playing, recording.src, total]);

  const seek = (seconds: number) => {
    positionRef.current = seconds;
    setPosition(seconds);
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      void videoRef.current.play();
    } else {
      setPlaying(true);
    }
  };

  const chapterIndex = recording.chapters.reduce((acc, c, i) => (position >= c.start ? i : acc), 0);

  return (
    <section className={styles.video} aria-label="Grabación de la clase">
      <div className={styles.screen}>
        {recording.src ? (
          <video
            ref={videoRef}
            className={styles.media}
            src={recording.src}
            preload="none"
            controls
            playsInline
            onTimeUpdate={(e) => setPosition(Math.floor(e.currentTarget.currentTime))}
          />
        ) : (
          <button type="button" className={styles.placeholder} onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pausar grabación' : 'Reproducir grabación'}>
            <span className={styles.play} aria-hidden="true">{playing ? '❚❚' : '▶'}</span>
            <span><b>{recording.label}</b><br />Grabación de la clase en vivo · {formatClock(total)}</span>
          </button>
        )}
        <div className={styles.bar}>
          <span>{formatClock(position)}</span>
          <i><b style={{ transform: `scaleX(${total ? position / total : 0})` }} /></i>
          <span>{formatClock(total)}</span>
        </div>
      </div>
      <ol role="list" className={styles.chapters} aria-label="Capítulos">
        {recording.chapters.map((c, i) => (
          <li key={c.start}>
            <button type="button" aria-pressed={i === chapterIndex} onClick={() => seek(c.start)}>
              <code>{formatClock(c.start)}</code>
              {c.title}
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
