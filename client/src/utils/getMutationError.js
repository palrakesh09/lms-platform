import axios from 'axios';
import { getFieldErrors } from './getFieldErrors.js';

// The one place write failures become user-facing copy. Returns { kind, message, fieldErrors }.
// Only the API's own messages for 409 conflicts are shown as-is (they name the real reason, for example
// "Cannot delete module because it contains topics"). Nothing else from the response reaches the UI.
export const getMutationError = (error, fallback = 'Something went wrong. Please try again.') => {
  if (!axios.isAxiosError(error)) {
    return { kind: 'unknown', message: fallback, fieldErrors: {} };
  }
  if (!error.response) {
    return { kind: 'network', message: 'Unable to reach the server. Check your connection and try again.', fieldErrors: {} };
  }

  const { status, data } = error.response;
  const fieldErrors = getFieldErrors(error);
  const firstDetail = Array.isArray(data?.error?.details) ? data.error.details[0]?.message : undefined;

  if (status === 401) {
    return { kind: 'unauthorized', message: 'Your session has expired. Please log in again.', fieldErrors: {} };
  }
  if (status === 403) {
    return { kind: 'forbidden', message: "You don't have permission to perform this action.", fieldErrors: {} };
  }
  if (status === 404) {
    return { kind: 'not-found', message: 'This item no longer exists. Refresh the page and try again.', fieldErrors };
  }
  if (status === 409) {
    const message = typeof data?.error?.message === 'string' ? data.error.message : 'This item conflicts with existing data.';
    return { kind: 'conflict', message, fieldErrors };
  }
  if (status === 400 || status === 422) {
    return { kind: 'validation', message: firstDetail ?? 'Please check your input and try again.', fieldErrors };
  }
  if (status === 429) {
    return { kind: 'rate-limited', message: 'Too many requests. Please wait a moment and try again.', fieldErrors: {} };
  }
  if (status >= 500) {
    return { kind: 'server', message: 'The server ran into a problem. Please try again in a moment.', fieldErrors: {} };
  }
  return { kind: 'unknown', message: fallback, fieldErrors: {} };
};