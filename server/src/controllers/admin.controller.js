import { getAdminStats } from '../services/stats.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const stats = async (_req, res) => {
  sendSuccess(res, { message: 'Statistics fetched successfully', data: await getAdminStats() });
};