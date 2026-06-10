import { asyncHandler } from "../middleware/asyncHandler.js";
import {
  createOrderValidation,
  updateOrderStatusValidation,
} from "../validations/index.js";
import {
  createOrder,
  getOrderById,
  getAllOrders,
  getOrdersByStatus,
  getOrdersByTable,
  updateOrderStatus,
  deleteOrder,
} from "../services/orderService.js";
import { successResponse, errorResponse } from "../utils/response.js";
import {
  emitNewOrder,
  emitOrderStatusUpdate,
} from "../sockets/socketHandler.js";
import { formatOrder } from "../utils/serializers.js";

export const createOrderController = asyncHandler(async (req, res) => {
  const normalizedBody = {
    ...req.body,
    tableNumber: req.body.tableNumber,
    notes: req.body.notes ?? "",
    items: (req.body.items || []).map((item) => ({
      food: item.food || item.foodId,
      foodId: item.foodId || item.food,
      quantity: item.quantity,
      note: item.note ?? "",
    })),
  };

  const { error, value } = createOrderValidation(normalizedBody);

  if (error) {
    const detailMessage =
      error.details?.map((d) => d.message).join(", ") || error.message;
    return errorResponse(res, 400, detailMessage, error.details);
  }

  const order = await createOrder(value);
  const formattedOrder = formatOrder(order);

  emitNewOrder(formattedOrder);

  successResponse(res, 201, "Order created successfully", formattedOrder);
});

export const getOrderByIdController = asyncHandler(async (req, res) => {
  const order = await getOrderById(req.params.id);
  successResponse(res, 200, "Order fetched successfully", formatOrder(order));
});

export const getAllOrdersController = asyncHandler(async (req, res) => {
  const orders = await getAllOrders();
  successResponse(
    res,
    200,
    "Orders fetched successfully",
    orders.map(formatOrder),
  );
});

export const getOrdersByStatusController = asyncHandler(async (req, res) => {
  const { status } = req.params;

  const validStatuses = [
    "Pending",
    "Preparing",
    "Ready",
    "pending",
    "preparing",
    "ready",
  ];

  if (!validStatuses.includes(status)) {
    return errorResponse(res, 400, "Invalid status");
  }

  const orders = await getOrdersByStatus(status);
  successResponse(
    res,
    200,
    "Orders fetched successfully",
    orders.map(formatOrder),
  );
});

export const getOrdersByTableController = asyncHandler(async (req, res) => {
  const tableNumber = decodeURIComponent(req.params.tableNumber).trim();

  if (!tableNumber) {
    return errorResponse(res, 400, "Invalid table number");
  }

  const orders = await getOrdersByTable(tableNumber);
  successResponse(
    res,
    200,
    "Orders fetched successfully",
    orders.map(formatOrder),
  );
});

export const updateOrderStatusController = asyncHandler(async (req, res) => {
  const { error, value } = updateOrderStatusValidation(req.body);

  if (error) {
    return errorResponse(res, 400, "Validation Error", error.details);
  }

  const order = await updateOrderStatus(req.params.id, value.status);
  const formattedOrder = formatOrder(order);

  emitOrderStatusUpdate(formattedOrder._id, formattedOrder.status);

  successResponse(
    res,
    200,
    "Order status updated successfully",
    formattedOrder,
  );
});

export const deleteOrderController = asyncHandler(async (req, res) => {
  await deleteOrder(req.params.id);
  successResponse(res, 200, "Order deleted successfully");
});
