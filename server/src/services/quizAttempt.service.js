import { ATTEMPT_STATUS, CONTENT_STATUS } from '../constants/lms.js';
import Question from '../models/Question.js';
import QuizAttempt from '../models/QuizAttempt.js';
import { ApiError } from '../utils/ApiError.js';
import { notFoundError } from '../utils/contentErrors.js';
import { listQuestions, listQuestionsForScoring } from './question.service.js';

const round1 = (value) => Math.round(value * 10) / 10;

const isLate = (attempt, quiz) => {
  if (!quiz.timeLimitMinutes) return false;
  const deadline = new Date(attempt.startedAt).getTime() + quiz.timeLimitMinutes * 60000;
  return Date.now() > deadline;
};

// Idempotent by design: calling this again while an attempt is already in progress resumes it instead
// of creating a second one. That both makes client-side refresh recovery trivial (the attempt page just
// calls /start again) and closes off "call start repeatedly" as a way to dodge maxAttempts.
export const startQuiz = async (student, quiz) => {
  if (quiz.status !== CONTENT_STATUS.PUBLISHED) throw notFoundError();

  const existing = await QuizAttempt.findOne({ student: student.id, quiz: quiz._id, status: ATTEMPT_STATUS.IN_PROGRESS }).lean();
  if (existing) {
    return { attempt: existing, questions: await listQuestions(quiz._id) };
  }

  if (quiz.maxAttempts != null) {
    const submittedCount = await QuizAttempt.countDocuments({ student: student.id, quiz: quiz._id, status: ATTEMPT_STATUS.SUBMITTED });
    if (submittedCount >= quiz.maxAttempts) {
      throw new ApiError(409, `Maximum attempts reached (${quiz.maxAttempts}). No further attempts are allowed for this quiz.`);
    }
  }

  const attemptNumber = (await QuizAttempt.countDocuments({ student: student.id, quiz: quiz._id })) + 1;

  try {
    const attempt = await QuizAttempt.create({ student: student.id, quiz: quiz._id, course: quiz.course, attemptNumber });
    return { attempt: attempt.toObject(), questions: await listQuestions(quiz._id) };
  } catch (error) {
    // Two simultaneous "start" clicks can both pass the maxAttempts check above; the unique index on
    // {student, quiz, attemptNumber} is the real arbiter, and the loser just resumes the winner's row.
    if (error?.code === 11000) {
      const created = await QuizAttempt.findOne({ student: student.id, quiz: quiz._id, status: ATTEMPT_STATUS.IN_PROGRESS }).lean();
      if (created) return { attempt: created, questions: await listQuestions(quiz._id) };
    }
    throw error;
  }
};

export const submitQuiz = async (student, quiz, attemptId, answers) => {
  const attempt = await QuizAttempt.findById(attemptId);
  if (!attempt || String(attempt.student) !== student.id) throw notFoundError(); // never confirm another student's attempt exists
  if (String(attempt.quiz) !== String(quiz._id)) throw new ApiError(400, 'This attempt does not belong to this quiz');
  if (attempt.status === ATTEMPT_STATUS.SUBMITTED) throw new ApiError(409, 'This attempt has already been submitted');

  const questions = await listQuestionsForScoring(quiz._id);
  const questionById = new Map(questions.map((q) => [String(q._id), q]));

  // Every questionId is checked against THIS quiz's own set. An id belonging to another quiz, or any
  // id that doesn't exist, is rejected outright — never silently scored as wrong.
  const seen = new Set();
  const scoredAnswers = answers.map(({ questionId, selectedAnswer }) => {
    if (seen.has(questionId)) throw new ApiError(400, 'Duplicate answer for the same question');
    seen.add(questionId);

    const question = questionById.get(questionId);
    if (!question) throw new ApiError(400, 'One or more answers reference a question that does not belong to this quiz');

    // isCorrect and pointsEarned come ONLY from the server's own correctAnswer, never from anything
    // the client sent alongside selectedAnswer.
    const isCorrect = question.correctAnswer === selectedAnswer.trim().toLowerCase();
    return { question: question._id, selectedAnswer, isCorrect, pointsEarned: isCorrect ? question.points : 0 };
  });

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const score = scoredAnswers.reduce((sum, a) => sum + a.pointsEarned, 0);
  const percentage = totalPoints === 0 ? 0 : round1((score / totalPoints) * 100);

  attempt.answers = scoredAnswers;
  attempt.score = score;
  attempt.totalPoints = totalPoints;
  attempt.percentage = percentage;
  attempt.passed = percentage >= quiz.passingScore;
  attempt.status = ATTEMPT_STATUS.SUBMITTED;
  attempt.submittedAt = new Date();
  attempt.submittedLate = isLate(attempt, quiz); // recorded, not penalized — see the Phase 9 write-up
  await attempt.save();

  return attempt.toObject();
};

export const getOwnAttempt = async (student, attemptId) => {
  const attempt = await QuizAttempt.findById(attemptId).populate('quiz', 'title passingScore maxAttempts').lean();
  if (!attempt || String(attempt.student) !== student.id) throw notFoundError(); // identical 404 whether missing or someone else's
  return attempt;
};

export const listOwnAttempts = (student, quizId) =>
  QuizAttempt.find({ student: student.id, quiz: quizId }).sort({ attemptNumber: 1 }).lean();