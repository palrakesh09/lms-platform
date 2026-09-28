export const NOTIFICATION_TYPES = Object.freeze({
  COURSE_PUBLISHED: 'course_published',
  COURSE_UPDATED: 'course_updated', // reserved
  RESOURCE_PUBLISHED: 'resource_published',
  QUIZ_PUBLISHED: 'quiz_published',
  QUIZ_RESULT: 'quiz_result',
  CONCEPT_COMPLETED: 'concept_completed', // reserved: concept completion is activity-only
  COURSE_COMPLETED: 'course_completed',
  ENROLLMENT: 'enrollment',
  ANNOUNCEMENT: 'announcement',
  SYSTEM: 'system', // reserved
});

export const NOTIFICATION_ENTITY_TYPES = Object.freeze(['course', 'resource', 'quiz', 'quiz_attempt', 'concept', 'announcement']);

export const ACTIVITY_TYPES = Object.freeze({
  COURSE_ENROLLED: 'course_enrolled',
  RESOURCE_VIEWED: 'resource_viewed',
  CONCEPT_COMPLETED: 'concept_completed',
  QUIZ_STARTED: 'quiz_started',
  QUIZ_SUBMITTED: 'quiz_submitted',
  QUIZ_PASSED: 'quiz_passed',
  QUIZ_FAILED: 'quiz_failed',
  COURSE_COMPLETED: 'course_completed',
});

export const ANNOUNCEMENT_AUDIENCE = Object.freeze({
  ALL_STUDENTS: 'all_students', // every active student (admin only)
  ENROLLED_STUDENTS: 'enrolled_students', // students with any active/completed enrollment (admin only)
  COURSE_STUDENTS: 'course_students', // students enrolled in one course (admin, or the course's mentor)
});

export const ANNOUNCEMENT_STATUS = Object.freeze({ DRAFT: 'draft', PUBLISHED: 'published' });

export const NOTIFICATION_LIMITS = Object.freeze({ BATCH_SIZE: 1000, MAX_TITLE: 150, MAX_MESSAGE: 1000 });