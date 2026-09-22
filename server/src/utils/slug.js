import { ApiError } from './ApiError.js';

const MAX_SLUG_LENGTH = 160;

// "Web 2.0 & Beyond" -> "web-2-0-beyond". Returns "" when nothing usable remains (e.g. a non-Latin title).
export const slugify = (text) =>
  text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/, '');

// An explicit slug wins. Otherwise derive one from the title, or ask the caller for one.
export const resolveSlug = ({ slug, title }) => {
  const resolved = slug ?? slugify(title);

  if (!resolved) {
    throw new ApiError(422, 'Validation failed', [
      { field: 'slug', message: 'A slug could not be generated from the title. Please provide one.' },
    ]);
  }
  return resolved;
};

// Turns a duplicate-key error into a clean 409. Every unique index on content involves the slug.
export const toSlugConflict = (error, message) =>
  error?.code === 11000
    ? new ApiError(409, message, [{ field: 'slug', message: 'This slug is already in use' }])
    : error;