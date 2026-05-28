import { asyncHandler } from '../middleware/asyncHandler.js';
import { getOrderStatistics } from '../services/orderService.js';
import { successResponse } from '../utils/response.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await getOrderStatistics();
  successResponse(res, 200, 'Dashboard statistics retrieved', stats);
});
