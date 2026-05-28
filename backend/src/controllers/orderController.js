import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  createOrderValidation,
  updateOrderStatusValidation,
} from '../validations/index.js';
import {
  createOrder,
  getOrderById,
  getAllOrders,
  getOrdersByStatus,
  getOrdersByTable,
  updateOrderStatus,
  deleteOrder,
} from '../services/orderService.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { emitNewOrder, emitOrderStatusUpdate } from '../sockets/socketHandler.js';

export const createOrderController = asyncHandler(async (req, res) => {
  const { error, value } = createOrderValidation(req.body);

  if (error) {
    return errorResponse(res, 400, 'Validation Error', error.details);
  }

  const order = await createOrder(value);
  
  // Emit new order event to admin room
  emitNewOrder(order);
  
  successResponse(res, 201, 'Order created successfully', order);
});

export const getOrderByIdController = asyncHandler(async (req, res) => {
  const order = await getOrderById(req.params.id);
  successResponse(res, 200, 'Order fetched successfully', order);
});

export const getAllOrdersController = asyncHandler(async (req, res) => {
  const orders = await getAllOrders();
  successResponse(res, 200, 'Orders fetched successfully', orders);
});

export const getOrdersByStatusController = asyncHandler(async (req, res) => {
  const { status } = req.params;

  const validStatuses = ['Pending', 'Preparing', 'Ready'];

  if (!validStatuses.includes(status)) {
    return errorResponse(res, 400, 'Invalid status');
  }

  const orders = await getOrdersByStatus(status);
  successResponse(res, 200, 'Orders fetched successfully', orders);
});

export const getOrdersByTableController = asyncHandler(async (req, res) => {
  const tableNumber = Number(req.params.tableNumber);

  if (!Number.isInteger(tableNumber) || tableNumber <= 0) {
    return errorResponse(res, 400, 'Invalid table number');
  }

  const orders = await getOrdersByTable(tableNumber);
  successResponse(res, 200, 'Orders fetched successfully', orders);
});

export const updateOrderStatusController = asyncHandler(async (req, res) => {
  const { error, value } = updateOrderStatusValidation(req.body);

  if (error) {
    return errorResponse(res, 400, 'Validation Error', error.details);
  }

  const order = await updateOrderStatus(req.params.id, value.status);
  
  // Emit order status update event to admin room
  emitOrderStatusUpdate(req.params.id, value.status);
  
  successResponse(res, 200, 'Order status updated successfully', order);
});

export const deleteOrderController = asyncHandler(async (req, res) => {
  await deleteOrder(req.params.id);
  successResponse(res, 200, 'Order deleted successfully');
});
