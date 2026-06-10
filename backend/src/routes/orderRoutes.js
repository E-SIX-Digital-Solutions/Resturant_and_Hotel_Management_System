import express from "express";
import {
  createOrderController,
  getOrderByIdController,
  getAllOrdersController,
  getOrdersByStatusController,
  updateOrderStatusController,
  deleteOrderController,
  getOrdersByTableController,
} from "../controllers/orderController.js";
import { auth, authorize } from "../middleware/auth.js";

const router = express.Router();

/**
 * @openapi
 * /orders:
 *   post:
 *     tags:
 *       - Orders
 *     summary: Create an order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderCreateRequest'
 *     responses:
 *       201:
 *         description: Order created successfully
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
 * /orders/table/{tableNumber}:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get orders by table number
 *     parameters:
 *       - in: path
 *         name: tableNumber
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Orders fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid table number
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * /orders/status/{status}:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get orders by status
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Pending, Preparing, Ready]
 *     responses:
 *       200:
 *         description: Orders fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * /orders/{id}:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get an order by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *   put:
 *     tags:
 *       - Orders
 *     summary: Update an order status
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
 *             $ref: '#/components/schemas/OrderStatusRequest'
 *     responses:
 *       200:
 *         description: Order status updated successfully
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
 *       - Orders
 *     summary: Delete an order
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
 *         description: Order deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */

// Public routes
router.post("/", createOrderController);
router.get("/table/:tableNumber", getOrdersByTableController);

// Protected routes
router.get("/", auth, getAllOrdersController);
router.get("/status/:status", auth, getOrdersByStatusController);
router.get("/:id", getOrderByIdController);

// Admin routes for updating order status
router.put(
  "/:id/status",
  auth,
  authorize("admin"),
  updateOrderStatusController,
);

// Admin routes
router.delete("/:id", auth, authorize("admin"), deleteOrderController);

export default router;
