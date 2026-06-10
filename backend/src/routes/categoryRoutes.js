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

/**
 * @openapi
 * /categories:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Get all categories
 *     responses:
 *       200:
 *         description: Categories fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *   post:
 *     tags:
 *       - Categories
 *     summary: Create a category
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryRequest'
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * /categories/{id}:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Get a category by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *   put:
 *     tags:
 *       - Categories
 *     summary: Update a category
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryRequest'
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     tags:
 *       - Categories
 *     summary: Delete a category
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */

// Public routes
router.get('/', getAllCategoriesController);
router.get('/:id', getCategoryByIdController);

// Protected routes (admin only)
router.post('/', auth, authorize('admin'), createCategoryController);
router.put('/:id', auth, authorize('admin'), updateCategoryController);
router.delete('/:id', auth, authorize('admin'), deleteCategoryController);

export default router;
