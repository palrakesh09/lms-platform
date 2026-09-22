import axios from 'axios';

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

// Maps any thrown value to user-safe copy. Raw backend messages and error objects never reach the UI.
// `subject` names what was being loaded ("course", "resource", ...).
export const getErrorInfo = (error, subject = 'content') => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return {
        kind: 'network',
        title: 'Connection problem',
        message: 'Unable to load course content. Please try again.',
        retryable: true,
      };
    }

    const { status } = error.response;

    if (status === 401) {
      return { kind: 'unauthorized', title: 'Session expired', message: 'Your session has expired. Please log in again.', retryable: false };
    }
    if (status === 403) {
      return { kind: 'forbidden', title: 'Access denied', message: `You don't have permission to access this ${subject}.`, retryable: false };
    }
    if (status === 400 || status === 404) {
      return { kind: 'not-found', title: 'Not found', message: `${capitalize(subject)} not found.`, retryable: false };
    }
    if (status === 429) {
      return { kind: 'rate-limited', title: 'Too many requests', message: 'You are making requests too quickly. Please wait a moment and try again.', retryable: true };
    }
    if (status >= 500) {
      return { kind: 'server', title: 'Something went wrong', message: 'The server ran into a problem. Please try again in a moment.', retryable: true };
    }
  }

  return { kind: 'unknown', title: 'Something went wrong', message: 'Something went wrong. Please try again.', retryable: true };
};