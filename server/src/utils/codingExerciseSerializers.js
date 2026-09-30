import { isStaff } from '../policies/courseAccess.js';

const idOf = (v) => (v === null || v === undefined ? null : String(v));

// Never includes test case `code` (it's select:false and this function never reads it anyway). Hidden
// test cases are represented only by name+hidden flag — never their check logic.
export const toExercise = (ex, user) => ({
  id: idOf(ex._id),
  title: ex.title,
  slug: ex.slug,
  description: ex.description,
  instructions: ex.instructions,
  course: idOf(ex.course),
  attachmentId: idOf(ex.attachmentId),
  language: ex.language,
  starterHtml: ex.starterHtml,
  starterCss: ex.starterCss,
  starterJavaScript: ex.starterJavaScript,
  difficulty: ex.difficulty,
  hints: ex.hints,
  testCases: (ex.testCases ?? []).map((t) => ({ id: idOf(t._id), name: t.name, hidden: t.hidden })),
  status: ex.status,
  order: ex.order,
  createdAt: ex.createdAt,
  ...(isStaff(user) ? { createdBy: idOf(ex.createdBy), updatedBy: idOf(ex.updatedBy) } : {}),
});

// Management view (admin/mentor authoring): includes test CODE, since the author is the one writing it.
export const toManagementExercise = (ex, user) => ({ ...toExercise(ex, user), testCases: (ex.testCases ?? []).map((t) => ({ id: idOf(t._id), name: t.name, hidden: t.hidden, code: t.code })) });

export const toAttempt = (a) => ({
  id: idOf(a._id),
  exercise: idOf(a.exercise),
  status: a.status,
  submittedHtml: a.submittedHtml,
  submittedCss: a.submittedCss,
  submittedJavaScript: a.submittedJavaScript,
  passedTests: a.passedTests,
  totalTests: a.totalTests,
  outputSummary: a.outputSummary,
  startedAt: a.startedAt,
  submittedAt: a.submittedAt,
  results: a.results,
});

export const toAttemptSummary = (a) => ({
  id: idOf(a._id),
  status: a.status,
  passedTests: a.passedTests,
  totalTests: a.totalTests,
  submittedAt: a.submittedAt,
  createdAt: a.createdAt,
});