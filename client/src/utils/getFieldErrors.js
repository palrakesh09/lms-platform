import axios from 'axios';

// Turns the API's validation details into { fieldName: message } (first message per field).
export const getFieldErrors = (error) => {
  const details = axios.isAxiosError(error) ? error.response?.data?.error?.details : null;
  const fieldErrors = {};

  if (Array.isArray(details)) {
    for (const { field, message } of details) {
      if (field && !(field in fieldErrors)) {
        fieldErrors[field] = message;
      }
    }
  }

  return fieldErrors;
};