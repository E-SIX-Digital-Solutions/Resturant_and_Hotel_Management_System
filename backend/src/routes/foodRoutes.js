import express from 'express';
import {
  createFoodController,
  updateFoodController,
  deleteFoodController,
  getFoodByIdController,
  getAllFoodsController,
  getFoodsByCategoryController,
  toggleFoodAvailabilityController,
} from '../controllers/foodController.js';
import { auth, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getAllFoodsController);
router.get('/:id', getFoodByIdController);
router.get('/category/:categoryId', getFoodsByCategoryController);

// Protected routes (admin only)
router.post(
  '/',
  auth,
  authorize('admin'),
  upload.single('image'),
  createFoodController
);
router.put(
  '/:id',
  auth,
  authorize('admin'),
  upload.single('image'),
  updateFoodController
);
router.delete('/:id', auth, authorize('admin'), deleteFoodController);
router.patch(
  '/:id/availability',
  auth,
  authorize('admin'),
  toggleFoodAvailabilityController
);

export default router;
