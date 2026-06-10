import express from 'express';
import { getDashboardStats } from '../controllers/adminController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @openapi
 * /admin/stats:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get dashboard statistics
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */

// Admin only routes
router.get('/stats', auth, authorize('admin'), getDashboardStats);

export default router;
