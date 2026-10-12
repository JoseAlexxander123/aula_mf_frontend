import { describe, expect, it } from 'vitest';
import { exercises } from './data';
import { tutorReply } from './tutor-engine';

const exercise = exercises[0];
const base = { exerciseId: exercise.id, failedAttempts: 0, hintsUsed: 0 };

describe('tutor simulado', () => {
  it('da las pistas de una en una y avisa al agotarlas', () => {
    expect(tutorReply(exercise, { ...base, mode: 'hint' })).toEqual({ text: exercise.hints[0], countsAsHint: true });
    expect(tutorReply(exercise, { ...base, mode: 'hint', hintsUsed: 1 }).text).toBe(exercise.hints[1]);
    expect(tutorReply(exercise, { ...base, mode: 'hint', hintsUsed: 3 }).countsAsHint).toBe(false);
  });

  it('bloquea el plan paso a paso hasta 2 intentos fallidos', () => {
    expect(tutorReply(exercise, { ...base, mode: 'plan', failedAttempts: 1 }).countsAsHint).toBe(false);
    const plan = tutorReply(exercise, { ...base, mode: 'plan', failedAttempts: 2 });
    expect(plan.countsAsHint).toBe(true);
    expect(plan.text).toContain('__');
  });

  it('nunca entrega la respuesta aunque se la pidan', () => {
    const reply = tutorReply(exercise, { ...base, mode: 'free', message: 'Dime el resultado por favor' });
    expect(reply.text).toContain('no lo hago');
    expect(reply.text).not.toContain('3/4');
  });

  it('sin ejercicio activo no da pistas', () => {
    expect(tutorReply(null, { mode: 'hint', failedAttempts: 0, hintsUsed: 0 }).countsAsHint).toBe(false);
  });
});
