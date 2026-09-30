import { CONTENT_STATUS } from '../constants/lms.js';
import { ACTIVITY_TYPES, NOTIFICATION_TYPES as T } from '../constants/notifications.js';
import Concept from '../models/Concept.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Resource from '../models/Resource.js';
import { recordActivity } from './activity.service.js';
import { loadContentChain } from './contentAccess.service.js';
import { notifyFromCursor, notifyOne } from './notification.service.js';

export const conceptCodingStarted = (studentId, exercise) =>
  safely('conceptCodingStarted', () => recordActivity({ userId: studentId, type: 'coding_exercise_started', course: exercise.course, concept: exercise.attachmentId, title: exercise.title, dedupeKey: `coding_started:${exercise._id}:${studentId}` }));

export const conceptCodingSubmitted = (studentId, exercise, attempt) =>
  safely('conceptCodingSubmitted', () => recordActivity({
    userId: studentId, type: attempt.status === 'passed' ? 'coding_exercise_passed' : 'coding_exercise_submitted',
    course: exercise.course, concept: exercise.attachmentId, title: exercise.title,
    metadata: { attemptId: String(attempt._id), passedTests: attempt.passedTests, totalTests: attempt.totalTests },
    dedupeKey: `coding_submit:${attempt._id}`,
  }));

  
// Events must never fail the user's action. Awaited (so callers/tests are deterministic) but contained.
const safely = async (label, fn) => {
  try {
    await fn();
  } catch (error) {
    console.error(`[events] ${label} failed:`, error.message);
  }
};

const PUBLISHED = CONTENT_STATUS.PUBLISHED;
const isVisibleToStudents = ({ course, path }) => course.status === PUBLISHED && path.every((node) => node.status === PUBLISHED);
const day = () => new Date().toISOString().slice(0, 10);

// Streamed, never loaded whole: students with an active or completed enrollment in this course.
export const enrolledStudentsCursor = (courseId) =>
  Enrollment.find({ course: courseId, status: { $ne: 'cancelled' } }, 'student').lean().cursor();

const notifyEnrolled = (courseId, payload, dedupeKey) =>
  notifyFromCursor(enrolledStudentsCursor(courseId), (doc) => doc.student, payload, { dedupeKey });

const courseTitleOf = async (courseId) => (await Course.findById(courseId, 'title').lean())?.title ?? 'your course';

// ---- events -------------------------------------------------------------------------------------

export const courseEnrolled = (studentId, enrollment) =>
  safely('courseEnrolled', async () => {
    const course = await Course.findById(enrollment.course, 'title').lean();
    if (!course) return;
    const key = `enrollment:${course._id}:${new Date(enrollment.enrolledAt).getTime()}`; // re-enrolling later is a new event
    await notifyOne(
      studentId,
      { type: T.ENROLLMENT, title: 'Enrollment confirmed', message: `You are now enrolled in ${course.title}.`, entityType: 'course', entityId: course._id, course: course._id },
      { dedupeKey: key },
    );
    await recordActivity({ userId: studentId, type: ACTIVITY_TYPES.COURSE_ENROLLED, course: course._id, title: course.title, dedupeKey: key });
  });

// Caller guarantees this is a transition into "published". Audience = currently enrolled students. On a
// first publish nobody is enrolled yet (enrollment needs a published course), so nobody is notified.
export const coursePublished = (course) =>
  safely('coursePublished', () =>
    notifyEnrolled(
      course._id,
      { type: T.COURSE_PUBLISHED, title: 'Course available', message: `${course.title} is published and available.`, entityType: 'course', entityId: course._id, course: course._id },
      `course_published:${course._id}:${Date.now()}`,
    ),
  );

export const resourcePublished = (resource) =>
  safely('resourcePublished', async () => {
    const chain = await loadContentChain('resource', resource._id);
    if (!chain || !isVisibleToStudents(chain)) return; // never announce content students can't open
    const courseTitle = await courseTitleOf(chain.course._id);
    await notifyEnrolled(
      chain.course._id,
      { type: T.RESOURCE_PUBLISHED, title: 'New lesson available', message: `${resource.title} has been published in ${courseTitle}.`, entityType: 'resource', entityId: resource._id, course: chain.course._id },
      `resource_published:${resource._id}`, // one notification per resource, ever
    );
  });

export const quizPublished = (quiz, context) =>
  safely('quizPublished', async () => {
    if (!isVisibleToStudents(context)) return;
    const courseTitle = await courseTitleOf(quiz.course);
    await notifyEnrolled(
      quiz.course,
      { type: T.QUIZ_PUBLISHED, title: 'New quiz available', message: `${quiz.title} is now available in ${courseTitle}.`, entityType: 'quiz', entityId: quiz._id, course: quiz.course },
      `quiz_published:${quiz._id}`,
    );
  });

export const quizStarted = (studentId, quiz, attempt) =>
  safely('quizStarted', () =>
    recordActivity({ userId: studentId, type: ACTIVITY_TYPES.QUIZ_STARTED, course: quiz.course, quiz: quiz._id, title: quiz.title, metadata: { attemptId: String(attempt._id) }, dedupeKey: `quiz_started:${attempt._id}` }),
  );

// Never reads or emits answers: only the attempt id, the quiz title and the student's own pass flag.
export const quizSubmitted = (studentId, quiz, attempt) =>
  safely('quizSubmitted', async () => {
    const metadata = { attemptId: String(attempt._id), percentage: attempt.percentage, passed: attempt.passed };
    const base = { userId: studentId, course: quiz.course, quiz: quiz._id, title: quiz.title, metadata };
    await recordActivity({ ...base, type: ACTIVITY_TYPES.QUIZ_SUBMITTED, dedupeKey: `quiz_submitted:${attempt._id}` });
    await recordActivity({ ...base, type: attempt.passed ? ACTIVITY_TYPES.QUIZ_PASSED : ACTIVITY_TYPES.QUIZ_FAILED, dedupeKey: `quiz_outcome:${attempt._id}` });
    await notifyOne(
      studentId,
      { type: T.QUIZ_RESULT, title: 'Quiz submitted', message: `Your ${quiz.title} quiz result is ready.`, entityType: 'quiz_attempt', entityId: attempt._id, parentId: quiz._id, course: quiz.course },
      { dedupeKey: `quiz_result:${attempt._id}` },
    );
  });

// Activity only (see the write-up): the student just clicked the button, so a notification would be noise.
export const conceptCompleted = (studentId, conceptId, courseId) =>
  safely('conceptCompleted', async () => {
    const concept = await Concept.findById(conceptId, 'title').lean();
    await recordActivity({ userId: studentId, type: ACTIVITY_TYPES.CONCEPT_COMPLETED, course: courseId, concept: conceptId, title: concept?.title ?? '', dedupeKey: `concept_completed:${conceptId}` });
  });

// Caller guarantees this is an incomplete → completed transition.
export const courseCompleted = (studentId, courseId) =>
  safely('courseCompleted', async () => {
    const title = await courseTitleOf(courseId);
    await notifyOne(
      studentId,
      { type: T.COURSE_COMPLETED, title: 'Course completed', message: `You completed ${title}.`, entityType: 'course', entityId: courseId, course: courseId },
      { dedupeKey: `course_completed:${courseId}` },
    );
    await recordActivity({ userId: studentId, type: ACTIVITY_TYPES.COURSE_COMPLETED, course: courseId, title, dedupeKey: `course_completed:${courseId}` });
  });

// At most one row per student per resource per day, so re-opening a page never floods the feed.
export const resourceViewed = (studentId, courseId, conceptId, resourceId) =>
  safely('resourceViewed', async () => {
    const resource = await Resource.findById(resourceId, 'title').lean();
    await recordActivity({ userId: studentId, type: ACTIVITY_TYPES.RESOURCE_VIEWED, course: courseId, concept: conceptId, resource: resourceId, title: resource?.title ?? '', dedupeKey: `resource_viewed:${resourceId}:${day()}` });
  });