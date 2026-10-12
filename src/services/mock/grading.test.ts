import { describe, expect, it } from 'vitest';
import { weeklyQuiz } from './data';
import { checkFractionAnswer, gradeQuiz, starsFor } from './grading';

describe('estrellas de la práctica', () => {
  it('da 3 al primer intento sin pistas y nunca menos de 1', () => {
    expect(starsFor(1, 0)).toBe(3);
    expect(starsFor(2, 0)).toBe(2);
    expect(starsFor(2, 1)).toBe(1);
    expect(starsFor(5, 3)).toBe(1);
  });
});

describe('checkFractionAnswer', () => {
  it('acepta equivalentes y sugiere simplificar', () => {
    const r = checkFractionAnswer('6/8', [3, 4], 1, 0);
    expect(r.correct).toBe(true);
    expect(r.starsEarned).toBe(3);
    expect(r.feedback).toContain('3/4');
  });

  it('un formato inválido no cuenta como intento', () => {
    const r = checkFractionAnswer('tres cuartos', [3, 4], 1, 0);
    expect(r).toMatchObject({ correct: false, countsAsAttempt: false });
  });

  it('tras 2 intentos sugiere pedir pista', () => {
    expect(checkFractionAnswer('1/2', [3, 4], 2, 0).feedback).toContain('pista');
  });
});

describe('gradeQuiz', () => {
  it('califica y agrupa por competencia', () => {
    const result = gradeQuiz(weeklyQuiz.questions, { p1: '1', p2: '12', p3: '14/20', p4: '0', p5: '' }, false);
    expect(result.correctCount).toBe(3);
    expect(result.score).toBe(60);
    expect(result.points).toBe(12);
    expect(result.byCompetency.find((c) => c.competency === 'Operar')).toEqual({ competency: 'Operar', correct: 2, total: 2 });
  });

  it('marca el envío tardío', () => {
    expect(gradeQuiz(weeklyQuiz.questions, {}, true)).toMatchObject({ late: true, score: 0 });
  });
});
