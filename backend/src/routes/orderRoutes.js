import express from 'express';
import {
  createOrderController,
  getOrderByIdController,
  getAllOrdersController,
  getOrdersByStatusController,
  updateOrderStatusController,
  deleteOrderController,
  getOrdersByTableController,
} from '../controllers/orderController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/', createOrderController);
router.get('/table/:tableNumber', getOrdersByTableController);
router.get('/:id', getOrderByIdController);

// Protected routes
router.get('/', auth, getAllOrdersController);
router.get('/status/:status', auth, getOrdersByStatusController);

// Admin routes for updating order status
router.put(
  '/:id/status',
  auth,
  authorize('admin'),
  updateOrderStatusController
);

// Admin routes
router.delete('/:id', auth, authorize('admin'), deleteOrderController);

export default router;
