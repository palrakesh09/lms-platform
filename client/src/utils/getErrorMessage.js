import axios from 'axios';

// Turns any thrown value into a message that is safe and useful to show in the UI.
export const getErrorMessage = (error) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      return (
        error.response.data?.error?.message ??
        `The API responded with status ${error.response.status}.`
      );
    }
    return 'No response from the API. Is the backend running, and is VITE_API_URL correct?';
  }

  return error?.message ?? 'An unexpected error occurred.';
};