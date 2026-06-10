import { asyncHandler } from "../middleware/asyncHandler.js";
import {
  createFoodValidation,
  updateFoodValidation,
  normalizeFoodPayload,
} from "../validations/index.js";
import {
  createFood,
  updateFood,
  deleteFood,
  getFoodById,
  getAllFoods,
  getFoodsByCategory,
  updateFoodAvailability,
} from "../services/foodService.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { emitFoodAvailabilityChange } from "../sockets/socketHandler.js";
import { formatFood } from "../utils/serializers.js";

export const createFoodController = asyncHandler(async (req, res) => {
  const { error, value } = createFoodValidation(req.body);

  if (error) {
    return errorResponse(res, 400, "Validation Error", error.details);
  }

  const imageUrl = req.file?.filename
    ? `/uploads/foods/${req.file.filename}`
    : value.imageUrl || null;

  const food = await createFood(normalizeFoodPayload(value), imageUrl);
  successResponse(res, 201, "Food created successfully", formatFood(food));
});

export const updateFoodController = asyncHandler(async (req, res) => {
  const { error, value } = updateFoodValidation(req.body);

  if (error) {
    return errorResponse(res, 400, "Validation Error", error.details);
  }

  let imageUrl = null;

  if (req.file) {
    imageUrl = `/uploads/foods/${req.file.filename}`;
  } else if (value.imageUrl) {
    imageUrl = value.imageUrl;
  }

  const payload = normalizeFoodPayload({ ...value });
  const cleanedPayload = Object.fromEntries(
    Object.entries(payload).filter(([, fieldValue]) => fieldValue !== undefined),
  );

  const food = await updateFood(req.params.id, cleanedPayload, imageUrl);
  successResponse(res, 200, "Food updated successfully", formatFood(food));
});

export const deleteFoodController = asyncHandler(async (req, res) => {
  await deleteFood(req.params.id);
  successResponse(res, 200, "Food deleted successfully");
});

export const getFoodByIdController = asyncHandler(async (req, res) => {
  const food = await getFoodById(req.params.id);
  successResponse(res, 200, "Food fetched successfully", formatFood(food));
});

export const getAllFoodsController = asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  const foods = await getAllFoods({ category, search });
  successResponse(
    res,
    200,
    "Foods fetched successfully",
    foods.map(formatFood),
  );
});

export const getFoodsByCategoryController = asyncHandler(async (req, res) => {
  const foods = await getFoodsByCategory(req.params.categoryId);
  successResponse(
    res,
    200,
    "Foods fetched successfully",
    foods.map(formatFood),
  );
});

export const toggleFoodAvailabilityController = asyncHandler(
  async (req, res) => {
    const available =
      req.body.isAvailable !== undefined
        ? req.body.isAvailable
        : req.body.available;

    if (typeof available !== "boolean") {
      return errorResponse(res, 400, "isAvailable must be a boolean");
    }

    const food = await updateFoodAvailability(req.params.id, available);
    emitFoodAvailabilityChange(req.params.id, available);

    successResponse(
      res,
      200,
      "Food availability updated",
      formatFood(food),
    );
  },
);
