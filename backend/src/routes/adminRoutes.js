import express from 'express';
import { getDashboardStats } from '../controllers/adminController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Admin only routes
router.get('/stats', auth, authorize('admin'), getDashboardStats);

export default router;
