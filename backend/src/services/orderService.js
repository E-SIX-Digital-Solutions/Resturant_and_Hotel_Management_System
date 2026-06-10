import Order from "../models/Order.js";
import Food from "../models/Food.js";

const SERVICE_CHARGE_RATE = 0.15;

const generateOrderNumber = async () => {
  const count = await Order.countDocuments();
  return `#${1001 + count}`;
};

export const createOrder = async (orderData) => {
  const { tableNumber, items: incomingItems, notes } = orderData;

  if (!Array.isArray(incomingItems) || incomingItems.length === 0) {
    throw new Error("Order must contain at least one item");
  }

  const items = [];
  let subtotal = 0;

  for (const it of incomingItems) {
    const foodId = it.food || it.foodId;
    const { quantity, note = "" } = it;

    const food = await Food.findById(foodId);
    if (!food) {
      throw new Error(`Food not found: ${foodId}`);
    }

    if (!food.isAvailable) {
      throw new Error(`${food.nameEn} is currently unavailable`);
    }

    const itemSubtotal = Number((food.price * quantity).toFixed(2));
    subtotal += itemSubtotal;

    items.push({
      food: foodId,
      quantity,
      note,
      subtotal: itemSubtotal,
    });
  }

  subtotal = Number(subtotal.toFixed(2));
  const serviceCharge = Math.round(subtotal * SERVICE_CHARGE_RATE);
  const totalPrice = subtotal + serviceCharge;
  const orderNumber = await generateOrderNumber();

  const order = new Order({
    orderNumber,
    tableNumber: String(tableNumber).trim(),
    items,
    subtotal,
    serviceCharge,
    totalPrice,
    notes,
  });

  await order.save();
  return order.populate("items.food");
};

export const getOrderById = async (id) => {
  const order = await Order.findById(id).populate("items.food");

  if (!order) {
    throw new Error("Order not found");
  }

  return order;
};

export const getAllOrders = async () => {
  return Order.find().populate("items.food").sort({ createdAt: -1 });
};

export const getOrdersByStatus = async (status) => {
  const normalizedStatus =
    status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  return Order.find({ status: normalizedStatus })
    .populate("items.food")
    .sort({ createdAt: -1 });
};

export const getOrdersByTable = async (tableNumber) => {
  return Order.find({ tableNumber: String(tableNumber).trim() })
    .populate("items.food")
    .sort({ createdAt: -1 });
};

export const updateOrderStatus = async (id, status) => {
  const normalizedStatus =
    status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  const order = await Order.findByIdAndUpdate(
    id,
    { status: normalizedStatus },
    { new: true, runValidators: true },
  ).populate("items.food");

  if (!order) {
    throw new Error("Order not found");
  }

  return order;
};

export const deleteOrder = async (id) => {
  const order = await Order.findByIdAndDelete(id);

  if (!order) {
    throw new Error("Order not found");
  }

  return order;
};

export const getOrderStatistics = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const totalOrdersToday = await Order.countDocuments({
    createdAt: { $gte: today, $lt: tomorrow },
  });

  const pendingOrders = await Order.countDocuments({ status: "Pending" });
  const preparingOrders = await Order.countDocuments({ status: "Preparing" });
  const completedOrders = await Order.countDocuments({ status: "Ready" });

  const totalRevenueResult = await Order.aggregate([
    {
      $match: {
        status: "Ready",
        createdAt: { $gte: today, $lt: tomorrow },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$totalPrice" },
      },
    },
  ]);

  const totalRevenue =
    totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

  return {
    totalOrdersToday,
    pendingOrders,
    preparingOrders,
    completedOrders,
    totalRevenue,
  };
};
