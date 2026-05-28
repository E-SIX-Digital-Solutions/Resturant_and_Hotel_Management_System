import Order from '../models/Order.js';
import Food from '../models/Food.js';

export const createOrder = async (orderData) => {
  const { tableNumber, items: incomingItems, notes } = orderData;

  if (!Array.isArray(incomingItems) || incomingItems.length === 0) {
    throw new Error('Order must contain at least one item');
  }

  const items = [];
  let totalPrice = 0;

  for (const it of incomingItems) {
    const { food: foodId, quantity, note = '' } = it;

    const food = await Food.findById(foodId);
    if (!food) {
      throw new Error(`Food not found: ${foodId}`);
    }

    const subtotal = Number((food.price * quantity).toFixed(2));
    totalPrice += subtotal;

    items.push({
      food: foodId,
      quantity,
      note,
      subtotal,
    });
  }

  totalPrice = Number(totalPrice.toFixed(2));

  const order = new Order({ tableNumber, items, totalPrice, notes });
  await order.save();
  return order.populate('items.food');
};

export const getOrderById = async (id) => {
  const order = await Order.findById(id).populate('items.food');

  if (!order) {
    throw new Error('Order not found');
  }

  return order;
};

export const getAllOrders = async () => {
  const orders = await Order.find()
    .populate('items.food')
    .sort({ createdAt: -1 });
  return orders;
};

export const getOrdersByStatus = async (status) => {
  const orders = await Order.find({ status })
    .populate('items.food')
    .sort({ createdAt: -1 });
  return orders;
};

export const getOrdersByTable = async (tableNumber) => {
  const orders = await Order.find({ tableNumber })
    .populate('items.food')
    .sort({ createdAt: -1 });
  return orders;
};

export const updateOrderStatus = async (id, status) => {
  const order = await Order.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  ).populate('items.food');

  if (!order) {
    throw new Error('Order not found');
  }

  return order;
};

export const deleteOrder = async (id) => {
  const order = await Order.findByIdAndDelete(id);

  if (!order) {
    throw new Error('Order not found');
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

  const pendingOrders = await Order.countDocuments({ status: 'Pending' });
  const completedOrders = await Order.countDocuments({ status: 'Ready' });

  const totalRevenueResult = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: today, $lt: tomorrow },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$totalPrice' },
      },
    },
  ]);

  const totalRevenue =
    totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

  return {
    totalOrdersToday,
    pendingOrders,
    completedOrders,
    totalRevenue,
  };
};
