import express from 'express';
import {
  createCategoryController,
  getAllCategoriesController,
  getCategoryByIdController,
  updateCategoryController,
  deleteCategoryController,
} from '../controllers/categoryController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllCategoriesController);
router.get('/:id', getCategoryByIdController);

// Protected routes (admin only)
router.post('/', auth, authorize('admin'), createCategoryController);
router.put('/:id', auth, authorize('admin'), updateCategoryController);
router.delete('/:id', auth, authorize('admin'), deleteCategoryController);

export default router;
