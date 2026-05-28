import { Server } from 'socket.io';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Middleware for authentication (optional)
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    // You can validate token here if needed
    next();
  });

  // Connection handlers
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join room for admin dashboard
    socket.on('join-admin', () => {
      socket.join('admin');
      console.log('Client joined admin room:', socket.id);
    });

    // Leave admin room
    socket.on('leave-admin', () => {
      socket.leave('admin');
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Emit new order to admin
export const emitNewOrder = (order) => {
  const io = getIO();
  io.to('admin').emit('new-order', order);
};

// Emit order status update
export const emitOrderStatusUpdate = (orderId, status) => {
  const io = getIO();
  io.to('admin').emit('order-status-updated', {
    orderId,
    status,
  });
};

// Emit food availability change
export const emitFoodAvailabilityChange = (foodId, available) => {
  const io = getIO();
  io.emit('food-availability-changed', { foodId, available });
};
