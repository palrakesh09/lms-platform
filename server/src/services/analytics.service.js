import mongoose from 'mongoose';
import { ANALYTICS_RANGES } from '../constants/analytics.js';
import { CONTENT_STATUS, ROLES } from '../constants/lms.js';
import { PAGINATION } from '../constants/listing.js';
import Concept from '../models/Concept.js';
import Course from '../models/Course.js';
import Module from '../models/Module.js';
import Progress from '../models/Progress.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Resource from '../models/Resource.js';
import Topic from '../models/Topic.js';
import User from '../models/User.js';
import { escapeRegex } from '../utils/escapeRegex.js';
import { buildDailySeries, dayKeyOf, DAY_KEY_FORMAT, rangeStart, safeAverage, safePercent } from '../utils/analyticsDefinitions.js';
import { buildPagination } from '../utils/pagination.js';
import { notFoundError } from '../utils/contentErrors.js';
import { forbiddenError } from '../utils/authErrors.js';
import { canManageCourse } from '../policies/courseAccess.js';
import { getEnrollmentCountsForCourses, getSystemEnrollmentSummary } from './enrollment.service.js';

// Appended to getAdminOverview's return value (one extra field, computed alongside the existing ones):
//   enrollments: await getSystemEnrollmentSummary()
// Appended to each row of getAdminCourseAnalytics via a Map lookup (one extra aggregation call, not
// one per course):
//   const enrollmentCounts = await getEnrollmentCountsForCourses(courseIds);
//   ...
//   enrolledLearners: (enrollmentCounts.get(key)?.active ?? 0) + (enrollmentCounts.get(key)?.completed ?? 0),
//   completedLearners: enrollmentCounts.get(key)?.completed ?? 0,
export const getEnrollmentSummary = getSystemEnrollmentSummary;
export const getEnrollmentCountsByCourseIds = getEnrollmentCountsForCourses;

const oid = (id) => new mongoose.Types.ObjectId(String(id));

// ---- shared building blocks --------------------------------------------------------------------

// Published concept ids per course, in ONE pass (not one query per course) — used to build both the
// course-count table and per-course "published concepts" denominators without N+1.
const publishedConceptsByCourse = async (courseFilter = {}) => {
  const rows = await Module.aggregate([
    { $match: { status: CONTENT_STATUS.PUBLISHED, ...(courseFilter.course ? { course: courseFilter.course } : {}) } },
    { $lookup: { from: 'topics', let: { moduleId: '$_id' }, pipeline: [{ $match: { $expr: { $and: [{ $eq: ['$module', '$$moduleId'] }, { $eq: ['$status', CONTENT_STATUS.PUBLISHED] }] } } }], as: 'topics' } },
    { $unwind: '$topics' },
    { $lookup: { from: 'concepts', let: { topicId: '$topics._id' }, pipeline: [{ $match: { $expr: { $and: [{ $eq: ['$topic', '$$topicId'] }, { $eq: ['$status', CONTENT_STATUS.PUBLISHED] }] } } }, { $project: { _id: 1 } }], as: 'concepts' } },
    { $unwind: '$concepts' },
    { $group: { _id: '$course', conceptIds: { $addToSet: '$concepts._id' } } },
  ]);
  return new Map(rows.map((row) => [String(row._id), row.conceptIds]));
};

const flatten = (map) => [...map.values()].flat();

const activeLearnerMatch = (since, extra = {}) => ({ $or: [{ lastAccessedAt: { $gte: since } }, { completedAt: { $gte: since } }], ...extra });

// Distinct students active in `since..now`, from progress OR quiz activity, scoped to conceptIds/courseIds.
const countActiveLearners = async ({ since, conceptIds, courseIds }) => {
  const [progressStudents, quizStudents] = await Promise.all([
    conceptIds && conceptIds.length === 0
      ? []
      : Progress.distinct('student', activeLearnerMatch(since, conceptIds ? { concept: { $in: conceptIds } } : { course: { $in: courseIds } })),
    courseIds && courseIds.length === 0
      ? []
      : QuizAttempt.distinct('student', { course: { $in: courseIds ?? [] }, $or: [{ startedAt: { $gte: since } }, { submittedAt: { $gte: since } }] }),
  ]);
  return new Set([...progressStudents.map(String), ...quizStudents.map(String)]).size;
};

const quizSummaryFor = async (quizIds) => {
  if (quizIds.length === 0) return { attempts: 0, averageScore: 0, passRate: 0 };
  const [row] = await QuizAttempt.aggregate([
    { $match: { quiz: { $in: quizIds }, status: 'submitted' } },
    { $group: { _id: null, attempts: { $sum: 1 }, avgPct: { $avg: '$percentage' }, passed: { $sum: { $cond: ['$passed', 1, 0] } } } },
  ]);
  if (!row) return { attempts: 0, averageScore: 0, passRate: 0 };
  return { attempts: row.attempts, averageScore: Math.round(row.avgPct * 10) / 10, passRate: safePercent(row.passed, row.attempts) };
};

// ---- ADMIN --------------------------------------------------------------------------------------

export const getAdminOverview = async () => {
  const [userRows, courseRows, conceptCount, resourceCount, quizCount, quizSummary, activeLearners] = await Promise.all([
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    Course.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Concept.countDocuments({ status: CONTENT_STATUS.PUBLISHED }),
    Resource.countDocuments({ status: CONTENT_STATUS.PUBLISHED }),
    Quiz.countDocuments({}),
    quizSummaryFor((await Quiz.find({}, '_id').lean()).map((q) => q._id)),
    countActiveLearners({ since: rangeStart(30), courseIds: (await Course.find({}, '_id').lean()).map((c) => c._id) }),
  ]);

  const byRole = Object.fromEntries(userRows.map((r) => [r._id, r.count]));
  const byStatus = Object.fromEntries(courseRows.map((r) => [r._id, r.count]));

  return {
    users: { total: userRows.reduce((s, r) => s + r.count, 0), students: byRole.student ?? 0, mentors: byRole.mentor ?? 0, admins: byRole.admin ?? 0 },
    courses: { total: courseRows.reduce((s, r) => s + r.count, 0), published: byStatus.published ?? 0, draft: byStatus.draft ?? 0, archived: byStatus.archived ?? 0 },
    content: { totalConcepts: conceptCount, totalResources: resourceCount, totalQuizzes: quizCount },
    quizzes: { totalSubmittedAttempts: quizSummary.attempts, averageScore: quizSummary.averageScore, passRate: quizSummary.passRate },
    activeLearners, // last 30 days, system-wide — a fixed window for the top-line overview card
  };
};

export const getAdminCourseAnalytics = async ({ page, limit, search, status }) => {
  const filter = {};
  if (status) filter.status = status;
  if (search) filter.title = new RegExp(escapeRegex(search), 'i');

  const [courses, total] = await Promise.all([
    Course.find(filter, 'title status').sort({ title: 1, _id: 1 }).skip((page - 1) * limit).limit(limit).lean(),
    Course.countDocuments(filter),
  ]);
  if (courses.length === 0) return { items: [], pagination: buildPagination({ page, limit, total }) };

  const courseIds = courses.map((c) => c._id);
  const conceptsByCourse = await publishedConceptsByCourse({});
  const [resourceCounts, quizCounts, progressStats, quizStats, activeCounts] = await Promise.all([
    Resource.aggregate([
      { $lookup: { from: 'concepts', localField: 'concept', foreignField: '_id', as: 'c' } }, { $unwind: '$c' },
      { $lookup: { from: 'topics', localField: 'c.topic', foreignField: '_id', as: 't' } }, { $unwind: '$t' },
      { $lookup: { from: 'modules', localField: 't.module', foreignField: '_id', as: 'm' } }, { $unwind: '$m' },
      { $match: { 'm.course': { $in: courseIds }, status: CONTENT_STATUS.PUBLISHED } },
      { $group: { _id: '$m.course', count: { $sum: 1 } } },
    ]),
    Quiz.aggregate([{ $match: { course: { $in: courseIds } } }, { $group: { _id: '$course', count: { $sum: 1 } } }]),
    Progress.aggregate([
      { $match: { course: { $in: courseIds } } },
      { $group: { _id: { course: '$course', student: '$student' }, completed: { $sum: { $cond: ['$completed', 1, 0] } }, total: { $sum: 1 } } },
      { $group: { _id: '$_id.course', learners: { $sum: 1 }, completions: { $sum: '$completed' }, avgLearnerCompletionRatio: { $avg: { $cond: [{ $eq: ['$total', 0] }, 0, { $divide: ['$completed', '$total'] }] } } } },
    ]),
    QuizAttempt.aggregate([
      { $match: { course: { $in: courseIds }, status: 'submitted' } },
      { $group: { _id: '$course', attempts: { $sum: 1 }, avgPct: { $avg: '$percentage' }, passed: { $sum: { $cond: ['$passed', 1, 0] } } } },
    ]),
    countActiveLearnersByCourse(courseIds),
  ]);

  const resourceMap = new Map(resourceCounts.map((r) => [String(r._id), r.count]));
  const quizCountMap = new Map(quizCounts.map((r) => [String(r._id), r.count]));
  const progressMap = new Map(progressStats.map((r) => [String(r._id), r]));
  const quizStatMap = new Map(quizStats.map((r) => [String(r._id), r]));

  const items = courses.map((course) => {
    const key = String(course._id);
    const progress = progressMap.get(key);
    const quiz = quizStatMap.get(key);
    return {
      id: key,
      title: course.title,
      status: course.status,
      totalConcepts: conceptsByCourse.get(key)?.length ?? 0,
      totalResources: resourceMap.get(key) ?? 0,
      totalQuizzes: quizCountMap.get(key) ?? 0,
      activeLearners: activeCounts.get(key) ?? 0,
      conceptCompletions: progress?.completions ?? 0,
      averageLearnerProgress: progress ? safePercent(Math.round(progress.avgLearnerCompletionRatio * 1000), 1000) : 0,
      quizAttempts: quiz?.attempts ?? 0,
      averageQuizScore: quiz ? Math.round(quiz.avgPct * 10) / 10 : 0,
      quizPassRate: quiz ? safePercent(quiz.passed, quiz.attempts) : 0,
    };
  });

  return { items, pagination: buildPagination({ page, limit, total }) };
};

// Active learners per course, in one pass, for the course table (avoids N calls to countActiveLearners).
const countActiveLearnersByCourse = async (courseIds, since = rangeStart(30)) => {
  const [progressRows, quizRows] = await Promise.all([
    Progress.aggregate([{ $match: { course: { $in: courseIds }, $or: [{ lastAccessedAt: { $gte: since } }, { completedAt: { $gte: since } }] } }, { $group: { _id: '$course', students: { $addToSet: '$student' } } }]),
    QuizAttempt.aggregate([{ $match: { course: { $in: courseIds }, $or: [{ startedAt: { $gte: since } }, { submittedAt: { $gte: since } }] } }, { $group: { _id: '$course', students: { $addToSet: '$student' } } }]),
  ]);
  const map = new Map();
  for (const row of [...progressRows, ...quizRows]) {
    const key = String(row._id);
    const set = map.get(key) ?? new Set();
    row.students.forEach((s) => set.add(String(s)));
    map.set(key, set);
  }
  return new Map([...map.entries()].map(([k, v]) => [k, v.size]));
};

export const getActivitySeries = async ({ courseIds, days }) => {
  const since = rangeStart(days);
  const courseMatch = courseIds ? { course: { $in: courseIds } } : {};

  const [activeByDay, completionsByDay, quizByDay] = await Promise.all([
    Progress.aggregate([
      { $match: { ...courseMatch, $or: [{ lastAccessedAt: { $gte: since } }, { completedAt: { $gte: since } }] } },
      { $group: { _id: { $dateToString: { format: DAY_KEY_FORMAT, date: '$lastAccessedAt' } }, students: { $addToSet: '$student' } } },
    ]),
    Progress.aggregate([
      { $match: { ...courseMatch, completed: true, completedAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: DAY_KEY_FORMAT, date: '$completedAt' } }, count: { $sum: 1 } } },
    ]),
    QuizAttempt.aggregate([
      { $match: { ...courseMatch, status: 'submitted', submittedAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: DAY_KEY_FORMAT, date: '$submittedAt' } }, attempts: { $sum: 1 }, passed: { $sum: { $cond: ['$passed', 1, 0] } } } },
    ]),
  ]);

  const byDay = new Map();
  const upsert = (day, patch) => byDay.set(day, { ...byDay.get(day), ...patch });
  for (const row of activeByDay) upsert(row._id, { activeLearners: row.students.length });
  for (const row of completionsByDay) upsert(row._id, { conceptCompletions: row.count });
  for (const row of quizByDay) upsert(row._id, { quizAttempts: row.attempts, quizPasses: row.passed });

  return buildDailySeries(days, byDay, ['activeLearners', 'conceptCompletions', 'quizAttempts', 'quizPasses']);
};

// ---- MENTOR -------------------------------------------------------------------------------------

export const getMentorOverview = async (mentorId) => {
  const courses = await Course.find({ instructors: oid(mentorId) }, 'title status').lean();
  const courseIds = courses.map((c) => c._id);
  if (courseIds.length === 0) {
    return { courses: { total: 0, published: 0 }, activeLearners: 0, averageCourseProgress: 0, conceptCompletions: 0, quizzes: { attempts: 0, averageScore: 0, passRate: 0 } };
  }

  const [activeLearners, progressAgg, quizIds, quiz] = await Promise.all([
    countActiveLearners({ since: rangeStart(30), courseIds }),
    Progress.aggregate([
      { $match: { course: { $in: courseIds } } },
      { $group: { _id: { course: '$course', student: '$student' }, completed: { $sum: { $cond: ['$completed', 1, 0] } }, total: { $sum: 1 } } },
      { $group: { _id: null, completions: { $sum: '$completed' }, avgRatio: { $avg: { $cond: [{ $eq: ['$total', 0] }, 0, { $divide: ['$completed', '$total'] }] } } } },
    ]),
    Quiz.find({ course: { $in: courseIds } }, '_id').lean(),
    null,
  ]);
  const quizSummary = await quizSummaryFor(quizIds.map((q) => q._id));

  return {
    courses: { total: courses.length, published: courses.filter((c) => c.status === 'published').length },
    activeLearners,
    averageCourseProgress: progressAgg[0] ? safePercent(Math.round(progressAgg[0].avgRatio * 1000), 1000) : 0,
    conceptCompletions: progressAgg[0]?.completions ?? 0,
    quizzes: { attempts: quizSummary.attempts, averageScore: quizSummary.averageScore, passRate: quizSummary.passRate },
  };
};

// Authorization (ownership) is enforced by the CALLER via canManageCourse, mirroring every other
// course-scoped feature in this app — this function only computes numbers for an already-verified course.
export const getMentorCourseAnalytics = async (course) => {
  const conceptsByCourse = await publishedConceptsByCourse({ course: course._id });
  const conceptIds = conceptsByCourse.get(String(course._id)) ?? [];

  const [activeLearners, progressAgg, perConcept, quizIds, recentActivity] = await Promise.all([
    countActiveLearners({ since: rangeStart(30), conceptIds }),
    Progress.aggregate([
      { $match: { course: course._id } },
      { $group: { _id: { student: '$student' }, completed: { $sum: { $cond: ['$completed', 1, 0] } }, total: { $sum: 1 } } },
      { $group: { _id: null, avgRatio: { $avg: { $cond: [{ $eq: ['$total', 0] }, 0, { $divide: ['$completed', '$total'] }] } } } },
    ]),
    Progress.aggregate([
      { $match: { concept: { $in: conceptIds } } },
      { $group: { _id: '$concept', accessed: { $sum: 1 }, completed: { $sum: { $cond: ['$completed', 1, 0] } } } },
      { $lookup: { from: 'concepts', localField: '_id', foreignField: '_id', as: 'concept' } },
      { $unwind: '$concept' },
      { $project: { _id: 0, conceptId: '$_id', title: '$concept.title', accessed: 1, completed: 1 } },
    ]),
    Quiz.find({ course: course._id }, '_id').lean(),
    Progress.find({ course: course._id }).sort({ lastAccessedAt: -1 }).limit(10).select('concept lastAccessedAt completed completedAt').lean(),
  ]);
  const quizSummary = await quizSummaryFor(quizIds.map((q) => q._id));

  const byAccessed = [...perConcept].sort((a, b) => b.accessed - a.accessed);
  const byCompleted = [...perConcept].sort((a, b) => b.completed - a.completed);
  // "Low activity" = published concepts with a total of zero access records — the only students-blind
  // way to flag them without ranking or naming any individual learner.
  const accessedIds = new Set(perConcept.map((c) => String(c.conceptId)));
  const lowActivityConceptIds = conceptIds.filter((id) => !accessedIds.has(String(id)));
  const lowActivityConcepts = lowActivityConceptIds.length
    ? await Concept.find({ _id: { $in: lowActivityConceptIds } }, 'title').lean()
    : [];

  return {
    course: { id: String(course._id), title: course.title, status: course.status },
    activeLearners,
    conceptCompletionRate: safePercent(perConcept.reduce((s, c) => s + c.completed, 0), conceptIds.length * Math.max(1, activeLearners) || 1),
    overallProgress: progressAgg[0] ? safePercent(Math.round(progressAgg[0].avgRatio * 1000), 1000) : 0,
    quizzes: quizSummary,
    mostAccessedConcepts: byAccessed.slice(0, 5).map((c) => ({ conceptId: String(c.conceptId), title: c.title, accessCount: c.accessed })),
    mostCompletedConcepts: byCompleted.filter((c) => c.completed > 0).slice(0, 5).map((c) => ({ conceptId: String(c.conceptId), title: c.title, completedCount: c.completed })),
    lowActivityConcepts: lowActivityConcepts.map((c) => ({ conceptId: String(c._id), title: c.title })),
    recentActivity: recentActivity.map((row) => ({ conceptId: String(row.concept), lastAccessedAt: row.lastAccessedAt, completed: row.completed, completedAt: row.completedAt })),
  };
};

export const assertMentorOwnsCourse = (user, course) => {
  if (!course) throw notFoundError();
  if (!canManageCourse(user, course)) throw forbiddenError();
};

// ---- STUDENT --------------------------------------------------------------------------------------

export const getStudentOverview = async (studentId) => {
  const [progressAgg, quizSummary, recentProgress] = await Promise.all([
    Progress.aggregate([
      { $match: { student: oid(studentId) } },
      { $group: { _id: null, completed: { $sum: { $cond: ['$completed', 1, 0] } }, total: { $sum: 1 }, courses: { $addToSet: '$course' } } },
    ]),
    quizSummaryForStudent(studentId),
    Progress.findOne({ student: oid(studentId) }).sort({ lastAccessedAt: -1 }).populate('course', 'title').select('course lastAccessedResource lastAccessedAt').lean(),
  ]);
  const totals = progressAgg[0] ?? { completed: 0, total: 0, courses: [] };

  return {
    coursesWithProgress: totals.courses.length,
    conceptsCompleted: totals.completed,
    conceptsRemaining: Math.max(0, totals.total - totals.completed),
    quizzes: quizSummary,
    recentActivity: recentProgress
      ? { courseId: String(recentProgress.course?._id ?? recentProgress.course), courseTitle: recentProgress.course?.title, resourceId: recentProgress.lastAccessedResource ? String(recentProgress.lastAccessedResource) : null, lastAccessedAt: recentProgress.lastAccessedAt }
      : null,
  };
};

const quizSummaryForStudent = async (studentId) => {
  const [row] = await QuizAttempt.aggregate([
    { $match: { student: oid(studentId), status: 'submitted' } },
    { $group: { _id: null, attempts: { $sum: 1 }, avgPct: { $avg: '$percentage' }, passed: { $sum: { $cond: ['$passed', 1, 0] } }, failed: { $sum: { $cond: ['$passed', 0, 1] } } } },
  ]);
  if (!row) return { totalAttempts: 0, averageScore: 0, passRate: 0, passedCount: 0, failedCount: 0 };
  return { totalAttempts: row.attempts, averageScore: Math.round(row.avgPct * 10) / 10, passRate: safePercent(row.passed, row.attempts), passedCount: row.passed, failedCount: row.failed };
};

// Reuses Phase 8's own totalConcepts-per-course computation via publishedConceptsByCourse for consistency.
export const getStudentCoursePerformance = async (studentId) => {
  const rows = await Progress.aggregate([
    { $match: { student: oid(studentId) } },
    { $group: { _id: '$course', completed: { $sum: { $cond: ['$completed', 1, 0] } }, total: { $sum: 1 }, lastAccessedAt: { $max: '$lastAccessedAt' } } },
  ]);
  if (rows.length === 0) return [];

  const courseIds = rows.map((r) => r._id);
  const [courses, conceptsByCourse, quizByCourse] = await Promise.all([
    Course.find({ _id: { $in: courseIds }, status: CONTENT_STATUS.PUBLISHED }, 'title thumbnail level').lean(),
    publishedConceptsByCourse({}),
    QuizAttempt.aggregate([
      { $match: { student: oid(studentId), course: { $in: courseIds }, status: 'submitted' } },
      { $group: { _id: '$course', attempts: { $sum: 1 }, avgPct: { $avg: '$percentage' }, passed: { $sum: { $cond: ['$passed', 1, 0] } } } },
    ]),
  ]);
  const courseMap = new Map(courses.map((c) => [String(c._id), c]));
  const quizMap = new Map(quizByCourse.map((r) => [String(r._id), r]));

  return rows
    .filter((r) => courseMap.has(String(r._id)))
    .map((r) => {
      const key = String(r._id);
      const course = courseMap.get(key);
      const totalConcepts = conceptsByCourse.get(key)?.length ?? 0;
      const quiz = quizMap.get(key);
      return {
        course: { id: key, title: course.title, thumbnail: course.thumbnail, level: course.level },
        progressPercentage: safePercent(Math.min(r.completed, totalConcepts), totalConcepts),
        completedConcepts: Math.min(r.completed, totalConcepts),
        totalConcepts,
        lastAccessedAt: r.lastAccessedAt,
        quizAttempts: quiz?.attempts ?? 0,
        averageQuizScore: quiz ? Math.round(quiz.avgPct * 10) / 10 : 0,
        quizPassRate: quiz ? safePercent(quiz.passed, quiz.attempts) : 0,
      };
    })
    .sort((a, b) => a.course.title.localeCompare(b.course.title));
};

export const getStudentQuizPerformance = async (studentId) => {
  const rows = await QuizAttempt.aggregate([
    { $match: { student: oid(studentId), status: 'submitted' } },
    { $group: { _id: '$quiz', attempts: { $sum: 1 }, bestPct: { $max: '$percentage' }, avgPct: { $avg: '$percentage' }, lastSubmittedAt: { $max: '$submittedAt' }, anyPassed: { $max: { $cond: ['$passed', 1, 0] } } } },
    { $sort: { lastSubmittedAt: -1 } },
  ]);
  if (rows.length === 0) return [];

  const quizIds = rows.map((r) => r._id);
  const [quizzes, latestByQuiz] = await Promise.all([
    Quiz.find({ _id: { $in: quizIds } }, 'title course').populate('course', 'title').lean(),
    QuizAttempt.aggregate([{ $match: { student: oid(studentId), quiz: { $in: quizIds }, status: 'submitted' } }, { $sort: { submittedAt: -1 } }, { $group: { _id: '$quiz', latestPct: { $first: '$percentage' } } }]),
  ]);
  const quizMap = new Map(quizzes.map((q) => [String(q._id), q]));
  const latestMap = new Map(latestByQuiz.map((r) => [String(r._id), r.latestPct]));

  return rows
    .filter((r) => quizMap.has(String(r._id)))
    .map((r) => {
      const quiz = quizMap.get(String(r._id));
      return {
        quizId: String(r._id),
        quizTitle: quiz.title,
        courseTitle: quiz.course?.title ?? null,
        attempts: r.attempts,
        bestScore: Math.round(r.bestPct * 10) / 10,
        latestScore: Math.round((latestMap.get(String(r._id)) ?? r.bestPct) * 10) / 10,
        averageScore: Math.round(r.avgPct * 10) / 10,
        passed: r.anyPassed === 1,
        lastAttemptedAt: r.lastSubmittedAt,
      };
    });
};

export const getStudentActivitySeries = async (studentId, days) => {
  const since = rangeStart(days);
  const [completions, quizzes] = await Promise.all([
    Progress.aggregate([{ $match: { student: oid(studentId), completed: true, completedAt: { $gte: since } } }, { $group: { _id: { $dateToString: { format: DAY_KEY_FORMAT, date: '$completedAt' } }, count: { $sum: 1 } } }]),
    QuizAttempt.aggregate([{ $match: { student: oid(studentId), status: 'submitted', submittedAt: { $gte: since } } }, { $group: { _id: { $dateToString: { format: DAY_KEY_FORMAT, date: '$submittedAt' } }, attempts: { $sum: 1 }, passed: { $sum: { $cond: ['$passed', 1, 0] } } } }]),
  ]);
  const byDay = new Map();
  const upsert = (day, patch) => byDay.set(day, { ...byDay.get(day), ...patch });
  for (const row of completions) upsert(row._id, { conceptCompletions: row.count });
  for (const row of quizzes) upsert(row._id, { quizAttempts: row.attempts, quizPasses: row.passed });
  return buildDailySeries(days, byDay, ['conceptCompletions', 'quizAttempts', 'quizPasses']);
};

export const getMentorCourseIds = async (mentorId) => (await Course.find({ instructors: oid(mentorId) }, '_id').lean()).map((c) => c._id);