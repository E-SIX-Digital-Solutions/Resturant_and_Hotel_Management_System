import { asyncHandler } from '../middleware/asyncHandler.js';
import { createCategoryValidation } from '../validations/index.js';
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../services/categoryService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const createCategoryController = asyncHandler(async (req, res) => {
  const { error, value } = createCategoryValidation(req.body);

  if (error) {
    return errorResponse(res, 400, 'Validation Error', error.details);
  }

  const category = await createCategory(value.name);
  successResponse(res, 201, 'Category created successfully', category);
});

export const getAllCategoriesController = asyncHandler(async (req, res) => {
  const categories = await getAllCategories();
  successResponse(res, 200, 'Categories fetched successfully', categories);
});

export const getCategoryByIdController = asyncHandler(async (req, res) => {
  const category = await getCategoryById(req.params.id);
  successResponse(res, 200, 'Category fetched successfully', category);
});

export const updateCategoryController = asyncHandler(async (req, res) => {
  const { error, value } = createCategoryValidation(req.body);

  if (error) {
    return errorResponse(res, 400, 'Validation Error', error.details);
  }

  const category = await updateCategory(req.params.id, value.name);
  successResponse(res, 200, 'Category updated successfully', category);
});

export const deleteCategoryController = asyncHandler(async (req, res) => {
  await deleteCategory(req.params.id);
  successResponse(res, 200, 'Category deleted successfully');
});
