import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  createFoodValidation,
  updateFoodValidation,
} from '../validations/index.js';
import {
  createFood,
  updateFood,
  deleteFood,
  getFoodById,
  getAllFoods,
  getFoodsByCategory,
  updateFoodAvailability,
} from '../services/foodService.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { emitFoodAvailabilityChange } from '../sockets/socketHandler.js';

export const createFoodController = asyncHandler(async (req, res) => {
  const { error, value } = createFoodValidation(req.body);

  if (error) {
    return errorResponse(res, 400, 'Validation Error', error.details);
  }

  let imageUrl = null;

  if (req.file) {
    imageUrl = `/uploads/foods/${req.file.filename}`;
  }

  const food = await createFood(value, imageUrl);
  successResponse(res, 201, 'Food created successfully', food);
});

export const updateFoodController = asyncHandler(async (req, res) => {
  const { error, value } = updateFoodValidation(req.body);

  if (error) {
    return errorResponse(res, 400, 'Validation Error', error.details);
  }

  let imageUrl = null;

  if (req.file) {
    imageUrl = `/uploads/foods/${req.file.filename}`;
  }

  const food = await updateFood(req.params.id, value, imageUrl);
  successResponse(res, 200, 'Food updated successfully', food);
});

export const deleteFoodController = asyncHandler(async (req, res) => {
  await deleteFood(req.params.id);
  successResponse(res, 200, 'Food deleted successfully');
});

export const getFoodByIdController = asyncHandler(async (req, res) => {
  const food = await getFoodById(req.params.id);
  successResponse(res, 200, 'Food fetched successfully', food);
});

export const getAllFoodsController = asyncHandler(async (req, res) => {
  const foods = await getAllFoods();
  successResponse(res, 200, 'Foods fetched successfully', foods);
});

export const getFoodsByCategoryController = asyncHandler(async (req, res) => {
  const foods = await getFoodsByCategory(req.params.categoryId);
  successResponse(res, 200, 'Foods fetched successfully', foods);
});

export const toggleFoodAvailabilityController = asyncHandler(
  async (req, res) => {
    const { available } = req.body;

    if (typeof available !== 'boolean') {
      return errorResponse(res, 400, 'Available must be a boolean');
    }

    const food = await updateFoodAvailability(req.params.id, available);
    
    // Emit food availability change event to all connected clients
    emitFoodAvailabilityChange(req.params.id, available);
    
    successResponse(res, 200, 'Food availability updated', food);
  }
);
