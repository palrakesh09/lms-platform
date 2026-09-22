import { RESOURCE_TYPE_META } from './resourceTypes.js';

// Option lists for selects. These are fixed vocabularies defined by the API, not course data.
export const CONTENT_STATUS_OPTIONS = Object.freeze([
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
]);

export const LEVEL_OPTIONS = Object.freeze([
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]);

export const ROLE_OPTIONS = Object.freeze([
  { value: 'student', label: 'Student' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'admin', label: 'Admin' },
]);

export const RESOURCE_TYPE_OPTIONS = Object.freeze(
  Object.entries(RESOURCE_TYPE_META).map(([value, meta]) => ({ value, label: meta.label })),
);

export const valuesOf = (options) => options.map((option) => option.value);