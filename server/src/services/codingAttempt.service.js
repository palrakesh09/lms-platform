import { ATTEMPT_STATUS } from '../constants/codingPlayground.js';
import CodingAttempt from '../models/CodingAttempt.js';
import { ApiError } from '../utils/ApiError.js';
import { notFoundError } from '../utils/contentErrors.js';
import { conceptCodingSubmitted } from './notification.events.js'; // Phase 14's events funnel, extended below

export const submitAttempt = async (student, exercise, input) => {
  let attempt = input.attemptId ? await CodingAttempt.findOne({ _id: input.attemptId, student: student.id, exercise: exercise._id }) : null;
  if (input.attemptId && !attempt) throw notFoundError();
  if (!attempt) attempt = new CodingAttempt({ student: student.id, exercise: exercise._id, course: exercise.course });

  const total = exercise.testCases.length;
  const passed = input.results.filter((r) => r.passed).length;
  // Cross-check: the client can only report results for test names that actually belong to this
  // exercise, so a spoofed extra "passed" entry cannot inflate the count.
  const validNames = new Set(exercise.testCases.map((t) => t.name));
  const validResults = input.results.filter((r) => validNames.has(r.name));
  const validPassed = validResults.filter((r) => r.passed).length;

  attempt.submittedHtml = input.submittedHtml;
  attempt.submittedCss = input.submittedCss;
  attempt.submittedJavaScript = input.submittedJavaScript;
  attempt.results = validResults;
  attempt.passedTests = validPassed;
  attempt.totalTests = total;
  attempt.outputSummary = input.outputSummary;
  attempt.status = total === 0 ? ATTEMPT_STATUS.SUBMITTED : validPassed === total ? ATTEMPT_STATUS.PASSED : ATTEMPT_STATUS.FAILED;
  attempt.submittedAt = new Date();
  await attempt.save();

  await conceptCodingSubmitted(student.id, exercise, attempt);
  return attempt.toObject();
};

export const listOwnAttempts = (student, exerciseId) => CodingAttempt.find({ student: student.id, exercise: exerciseId }).sort({ createdAt: -1 }).lean();

export const getOwnAttempt = async (student, attemptId) => {
  const attempt = await CodingAttempt.findById(attemptId).lean();
  if (!attempt || String(attempt.student) !== student.id) throw notFoundError();
  return attempt;
};