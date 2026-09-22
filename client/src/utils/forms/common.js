// Client-side validation mirrors the server's rules for fast feedback. The server stays authoritative.
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SLUG_MESSAGE = 'Use lowercase letters, numbers and single hyphens (for example web-basics).';
export const URL_MESSAGE = 'Please enter a valid HTTP/HTTPS URL.';
export const MAX_ORDER = 100000;

export const lengthError = (label, value, { min = 0, max }) => {
  const length = value.trim().length;
  if (length < min) return `${label} must be at least ${min} characters`;
  if (length > max) return `${label} cannot exceed ${max} characters`;
  return null;
};

// Blank is allowed (the server appends new items). Otherwise a whole number from 0 to MAX_ORDER.
export const orderError = (value) => {
  const text = String(value).trim();
  if (text === '') return null;
  return /^\d+$/.test(text) && Number(text) <= MAX_ORDER ? null : `Order must be a whole number from 0 to ${MAX_ORDER}`;
};

export const parseOrder = (value) => {
  const text = String(value ?? '').trim();
  return text === '' ? undefined : Number(text);
};

export const orderToInput = (order) => (Number.isInteger(order) ? String(order) : '');

// [['field', 'message' | null], ...] -> { field: 'message' } with the empty entries removed.
export const collect = (entries) => Object.fromEntries(entries.filter(([, message]) => message));