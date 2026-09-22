import { loadContentChain } from './contentAccess.service.js';

// Resolves the course + ancestor-status path a quiz is attached to, by reusing the EXACT walk Phase 5
// built for module/topic/concept/resource. attachmentLevel 'course' yields an empty path (nothing sits
// between the quiz and the course). Returns null if the attachment (or any of its own ancestors) has
// been deleted — a defensive case that should not normally occur, since attachmentId is immutable.
export const loadQuizContext = (quiz) => loadContentChain(quiz.attachmentLevel, quiz.attachmentId);