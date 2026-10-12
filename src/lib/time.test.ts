import { describe, expect, it } from 'vitest';
import { addDaysToKey, formatClock, localDateKey, weekdayOfKey, zonedDateTime } from './time';

describe('tiempo y zonas horarias', () => {
  it('formatea el reloj de la evaluación', () => {
    expect(formatClock(900)).toBe('15:00');
    expect(formatClock(59)).toBe('00:59');
    expect(formatClock(-5)).toBe('00:00');
    expect(formatClock(3725)).toBe('1:02:05');
  });

  it('convierte hora local de Lima (UTC−5) a UTC', () => {
    expect(zonedDateTime('2026-10-13', 17, 0, 'America/Lima').toISOString()).toBe('2026-10-13T22:00:00.000Z');
  });

  it('obtiene el día local aunque en UTC ya sea mañana', () => {
    expect(localDateKey('2026-10-13T03:00:00Z', 'America/Lima')).toBe('2026-10-12');
  });

  it('suma días y calcula el día de la semana', () => {
    expect(addDaysToKey('2026-10-31', 1)).toBe('2026-11-01');
    expect(weekdayOfKey('2026-10-12')).toBe(1); // lunes
  });
});
