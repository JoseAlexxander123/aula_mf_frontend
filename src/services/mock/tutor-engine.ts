// Tutor IA SIMULADO (respuestas guionadas, sin modelo). Reproduce las reglas del prototipo
// (ver TUTOR-IA.md del prototipo para la versión real con LLM en el backend):
//  1. Nunca da la respuesta final ni hace tareas o evaluaciones.
//  2. Guía con preguntas y pistas graduales, de a una.
//  3. «Plan paso a paso» solo tras 2 intentos fallidos: estructura con espacios en blanco.
//  4. «Preguntar a mi profesor» escala la duda a un humano.

import type { TutorReply, TutorRequest } from '@/types/domain';
import type { ExerciseKey } from './data';

export const PLAN_UNLOCK_ATTEMPTS = 2;

const ASKS_FOR_ANSWER = /(respuesta|resu[eé]lv|hazme|haz (la|mi)|cu[aá]nto (es|da)|dime el resultado)/;
const ASKS_FOR_CONCEPT = /(qu[eé] es|por qu[eé]|c[oó]mo se|para qu[eé])/;

const GENERAL_CONCEPT = 'En matemáticas casi siempre conviene entender primero qué te piden y qué datos tienes.';

export function tutorReply(exercise: ExerciseKey | null, req: TutorRequest): TutorReply {
  if (!exercise && (req.mode === 'hint' || req.mode === 'plan')) {
    return { text: 'Abre la práctica de una lección y te doy pistas sobre ese ejercicio. 😉', countsAsHint: false };
  }
  const concept = exercise?.concept ?? GENERAL_CONCEPT;
  switch (req.mode) {
    case 'hint': {
      if (!exercise) break;
      if (req.hintsUsed >= exercise.hints.length) {
        return { text: 'Ya usaste todas las pistas de este ejercicio. Prueba con el plan paso a paso o pregúntale a tu profesor.', countsAsHint: false };
      }
      return { text: exercise.hints[req.hintsUsed], countsAsHint: true };
    }
    case 'concept':
      return { text: `${concept} ¿Qué crees que hay que hacer primero en este ejercicio?`, countsAsHint: false };
    case 'plan': {
      if (!exercise) break;
      if (req.failedAttempts < PLAN_UNLOCK_ATTEMPTS) {
        return { text: 'El plan paso a paso se abre cuando lo intentas 2 veces. ¡Inténtalo una vez más! Si quieres, te doy una pista.', countsAsHint: false };
      }
      const steps = exercise.steps.map((s, i) => `${i + 1}. ${s}`).join('\n');
      return { text: `Este es el camino. Tú completas cada espacio:\n${steps}`, countsAsHint: true };
    }
    case 'teacher':
      return {
        text: 'Listo: le envié tu duda a la Prof. Lucía con el ejercicio en el que estás. Te responde aquí antes de la próxima clase. Mientras, ¿probamos con una pista?',
        countsAsHint: false,
      };
    case 'free': {
      const q = (req.message ?? '').toLowerCase();
      if (ASKS_FOR_ANSWER.test(q)) {
        return { text: 'Eso no lo hago 😉: si te doy el resultado, no aprendes. Pero te ayudo a llegar. ¿Cuáles son los denominadores de este ejercicio?', countsAsHint: false };
      }
      if (ASKS_FOR_CONCEPT.test(q)) {
        return { text: `${concept} ¿Te muestro un ejemplo distinto al del ejercicio?`, countsAsHint: false };
      }
      return { text: 'Buena pregunta. Pensemos juntas: ¿qué dato del ejercicio crees que es el más importante? Si quieres, pide una pista.', countsAsHint: false };
    }
  }
  return { text: 'No entendí bien. ¿Me lo cuentas de otra forma?', countsAsHint: false };
}
