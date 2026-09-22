import { isStaff } from '../policies/courseAccess.js';

const idOf = (value) => (value === null || value === undefined ? null : String(value));

export const toQuiz = (quiz, user) => ({
  id: idOf(quiz._id),
  title: quiz.title,
  slug: quiz.slug,
  description: quiz.description,
  instructions: quiz.instructions,
  course: idOf(quiz.course),
  attachmentLevel: quiz.attachmentLevel,
  attachmentId: idOf(quiz.attachmentId),
  passingScore: quiz.passingScore,
  maxAttempts: quiz.maxAttempts,
  timeLimitMinutes: quiz.timeLimitMinutes,
  status: quiz.status,
  order: quiz.order,
  createdAt: quiz.createdAt,
  updatedAt: quiz.updatedAt,
  ...(isStaff(user) ? { createdBy: idOf(quiz.createdBy), updatedBy: idOf(quiz.updatedBy) } : {}),
});

// Never includes correctAnswer. This is the ONLY view a student ever receives, whether from the
// question list, a single question, or the questions returned by /start.
export const toStudentQuestion = (question) => ({
  id: idOf(question._id),
  question: question.question,
  type: question.type,
  options: (question.options ?? []).map((option) => ({ id: option.id, text: option.text })),
  points: question.points,
  order: question.order,
});

// Admin/mentor management view. correctAnswer is present only because the caller explicitly selected
// it (see question.service.js) — this serializer does not fetch it itself.
export const toManagementQuestion = (question, user) => ({
  id: idOf(question._id),
  quiz: idOf(question.quiz),
  question: question.question,
  type: question.type,
  options: question.options,
  correctAnswer: question.correctAnswer,
  explanation: question.explanation,
  points: question.points,
  order: question.order,
  createdAt: question.createdAt,
  updatedAt: question.updatedAt,
  ...(isStaff(user) ? { createdBy: idOf(question.createdBy), updatedBy: idOf(question.updatedBy) } : {}),
});

export const toStartView = (attempt, quiz, questions) => ({
  attemptId: idOf(attempt._id),
  attemptNumber: attempt.attemptNumber,
  status: attempt.status,
  startedAt: attempt.startedAt,
  quiz: { id: idOf(quiz._id), title: quiz.title, timeLimitMinutes: quiz.timeLimitMinutes, passingScore: quiz.passingScore },
  questions: questions.map(toStudentQuestion),
});

// Never includes correctAnswer, even for a just-submitted attempt: per-answer isCorrect is the review,
// not the answer key.
export const toResultView = (attempt, quiz) => ({
  attemptId: idOf(attempt._id),
  quizTitle: quiz.title,
  attemptNumber: attempt.attemptNumber,
  score: attempt.score,
  totalPoints: attempt.totalPoints,
  percentage: attempt.percentage,
  passed: attempt.passed,
  correctCount: attempt.answers.filter((a) => a.isCorrect).length,
  totalQuestions: attempt.answers.length,
  submittedAt: attempt.submittedAt,
  submittedLate: attempt.submittedLate,
});

export const toHistoryView = (attempt) => ({
  attemptId: idOf(attempt._id),
  attemptNumber: attempt.attemptNumber,
  status: attempt.status,
  score: attempt.score,
  totalPoints: attempt.totalPoints,
  percentage: attempt.percentage,
  passed: attempt.passed,
  startedAt: attempt.startedAt,
  submittedAt: attempt.submittedAt,
});

export const toAttemptDetailView = (attempt) => ({
  attemptId: idOf(attempt._id),
  quiz: attempt.quiz
    ? { id: idOf(attempt.quiz._id ?? attempt.quiz), title: attempt.quiz.title, passingScore: attempt.quiz.passingScore, maxAttempts: attempt.quiz.maxAttempts }
    : null,
  attemptNumber: attempt.attemptNumber,
  status: attempt.status,
  score: attempt.score,
  totalPoints: attempt.totalPoints,
  percentage: attempt.percentage,
  passed: attempt.passed,
  startedAt: attempt.startedAt,
  submittedAt: attempt.submittedAt,
  submittedLate: attempt.submittedLate,
  answers: attempt.answers.map((a) => ({
    questionId: idOf(a.question),
    selectedAnswer: a.selectedAnswer,
    isCorrect: a.isCorrect,
    pointsEarned: a.pointsEarned,
  })),
});