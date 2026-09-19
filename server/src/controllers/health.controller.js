import { sendSuccess } from '../utils/apiResponse.js';

export const getHealth = (_req, res) => {
  sendSuccess(res, { message: 'LMS API is running' });
};