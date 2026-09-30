// Identical shape to services/ai/retrieval's context resolution and quizAccess.service.js — reused
// authorization, not reinvented. A coding exercise is authorized exactly like a quiz: student needs
// enrollment + every ancestor published; mentor needs course ownership; admin unrestricted.
import { loadContentChain } from './contentAccess.service.js';

export const loadExerciseContext = (exercise) => loadContentChain(exercise.attachmentLevel, exercise.attachmentId);