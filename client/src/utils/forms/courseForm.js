import { LEVEL_OPTIONS, valuesOf } from '../enums.js';
import { getSafeUrl } from '../safeUrl.js';
import { SLUG_MESSAGE, SLUG_PATTERN, URL_MESSAGE, collect, lengthError } from './common.js';

export const emptyCourseValues = Object.freeze({
  title: '',
  slug: '',
  shortDescription: '',
  description: '',
  thumbnail: '',
  category: '',
  level: 'beginner',
});

export const courseToFormValues = (course) => ({
  title: course.title ?? '',
  slug: course.slug ?? '',
  shortDescription: course.shortDescription ?? '',
  description: course.description ?? '',
  thumbnail: course.thumbnail ?? '',
  category: course.category ?? '',
  level: course.level ?? 'beginner',
});

export const validateCourseForm = (values, { isAdmin }) => {
  const slug = values.slug.trim();
  const category = values.category.trim();
  const thumbnail = values.thumbnail.trim();

  const categoryProblem = !category
    ? 'Category is required'
    : !SLUG_PATTERN.test(category.toLowerCase())
      ? 'Use lowercase letters, numbers and hyphens (for example web-development).'
      : lengthError('Category', category, { max: 60 });

  return collect([
    ['title', lengthError('Title', values.title, { min: 2, max: 150 })],
    ['slug', isAdmin && slug && (!SLUG_PATTERN.test(slug.toLowerCase()) ? SLUG_MESSAGE : lengthError('Slug', slug, { max: 160 }))],
    ['shortDescription', lengthError('Short description', values.shortDescription, { max: 200 })],
    ['description', lengthError('Description', values.description, { max: 5000 })],
    ['thumbnail', thumbnail && !getSafeUrl(thumbnail) ? URL_MESSAGE : null],
    ['category', categoryProblem],
    ['level', valuesOf(LEVEL_OPTIONS).includes(values.level) ? null : 'Choose a level'],
  ]);
};

// Only editable fields are ever sent: never status, instructors, order or audit fields.
// Mentors never send a slug (the API rejects it for them). A blank or unchanged slug is omitted.
export const buildCoursePayload = (values, { isNew, isAdmin, original }) => {
  const payload = {
    title: values.title.trim(),
    shortDescription: values.shortDescription.trim(),
    description: values.description.trim(),
    thumbnail: values.thumbnail.trim(), // '' clears it
    category: values.category.trim().toLowerCase(),
    level: values.level,
  };

  if (isAdmin) {
    const slug = values.slug.trim().toLowerCase();
    if (slug && (isNew || slug !== original?.slug)) payload.slug = slug;
  }
  return payload;
};