import { CONTENT_STATUS_OPTIONS, LEVEL_OPTIONS, ROLE_OPTIONS, valuesOf } from './enums.js';

const MAX_PAGE = 10000;
const MAX_SEARCH_LENGTH = 100;

// URL parameters are user-editable, so every value is validated before it reaches the API.
const pick = (value, allowed) => (allowed.includes(value) ? value : '');

export const parsePage = (value) => {
  const page = Number.parseInt(value ?? '', 10);
  return Number.isInteger(page) && page >= 1 && page <= MAX_PAGE ? page : 1;
};

export const parseSearch = (value) => (value ?? '').trim().slice(0, MAX_SEARCH_LENGTH);

// Categories are slugs on the server: "Web Development" -> "web-development".
export const parseCategory = (value) =>
  (value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);

export const parseCourseListParams = (searchParams) => ({
  page: parsePage(searchParams.get('page')),
  search: parseSearch(searchParams.get('search')),
  category: parseCategory(searchParams.get('category')),
  level: pick(searchParams.get('level'), valuesOf(LEVEL_OPTIONS)),
  status: pick(searchParams.get('status'), valuesOf(CONTENT_STATUS_OPTIONS)),
});

export const parseUserListParams = (searchParams) => {
  const isActive = searchParams.get('isActive');

  return {
    page: parsePage(searchParams.get('page')),
    search: parseSearch(searchParams.get('search')),
    role: pick(searchParams.get('role'), valuesOf(ROLE_OPTIONS)),
    isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
  };
};