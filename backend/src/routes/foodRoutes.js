import express from "express";
import {
  createFoodController,
  updateFoodController,
  deleteFoodController,
  getFoodByIdController,
  getAllFoodsController,
  getFoodsByCategoryController,
  toggleFoodAvailabilityController,
} from "../controllers/foodController.js";
import { auth, authorize } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

/**
 * @openapi
 * /foods:
 *   get:
 *     tags:
 *       - Foods
 *     summary: Get all food items
 *     responses:
 *       200:
 *         description: Foods fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *   post:
 *     tags:
 *       - Foods
 *     summary: Create a food item
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/FoodCreateRequest'
 *     responses:
 *       201:
 *         description: Food created successfully
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
 * /foods/{id}:
 *   get:
 *     tags:
 *       - Foods
 *     summary: Get a food item by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Food fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *   put:
 *     tags:
 *       - Foods
 *     summary: Update a food item
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
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/FoodUpdateRequest'
 *     responses:
 *       200:
 *         description: Food updated successfully
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
 *       - Foods
 *     summary: Delete a food item
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
 *         description: Food deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 * /foods/category/{categoryId}:
 *   get:
 *     tags:
 *       - Foods
 *     summary: Get food items by category
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Foods fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 * /foods/{id}/availability:
 *   patch:
 *     tags:
 *       - Foods
 *     summary: Toggle food availability
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
 *             $ref: '#/components/schemas/AvailabilityRequest'
 *     responses:
 *       200:
 *         description: Food availability updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Available must be a boolean
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// Public routes
router.get("/", getAllFoodsController);
router.get("/category/:categoryId", getFoodsByCategoryController);
router.get("/:id", getFoodByIdController);

// Protected routes (admin only)
router.post(
  "/",
  auth,
  authorize("admin"),
  upload.single("image"),
  createFoodController,
);
router.put(
  "/:id",
  auth,
  authorize("admin"),
  upload.single("image"),
  updateFoodController,
);
router.delete("/:id", auth, authorize("admin"), deleteFoodController);
router.patch(
  "/:id/availability",
  auth,
  authorize("admin"),
  toggleFoodAvailabilityController,
);

export default router;
