export const ROLES = Object.freeze({
  ADMIN: 'admin',
  MENTOR: 'mentor',
  STUDENT: 'student',
});

export const CONTENT_STATUS = Object.freeze({
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
});

export const COURSE_LEVELS = Object.freeze({
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
});

export const RESOURCE_TYPES = Object.freeze({
  THEORY: 'theory',
  TASK: 'task',
  MINI_PROJECT: 'mini-project',
});

// Lowercase words separated by single hyphens, e.g. "how-the-internet-works".
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;