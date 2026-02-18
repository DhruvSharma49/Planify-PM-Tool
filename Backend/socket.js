const jwt = require('jsonwebtoken');

const setupSocket = (io) => {
  // Auth middleware for socket
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.cookie
      ?.split(';')
      .find(c => c.trim().startsWith('accessToken='))
      ?.split('=')[1];

    if (!token) {
      // Allow connection but user won't be authenticated
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch {
      next();
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}, userId: ${socket.userId}`);

    // Join personal room for notifications
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Join project room
    socket.on('project:join', (projectId) => {
      socket.join(`project:${projectId}`);
      console.log(`Socket ${socket.id} joined project:${projectId}`);
    });

    // Leave project room
    socket.on('project:leave', (projectId) => {
      socket.leave(`project:${projectId}`);
    });

    // Join task room for comments
    socket.on('task:join', (taskId) => {
      socket.join(`task:${taskId}`);
    });

    socket.on('task:leave', (taskId) => {
      socket.leave(`task:${taskId}`);
    });

    // Typing indicator for comments
    socket.on('comment:typing', ({ taskId, userName }) => {
      socket.to(`task:${taskId}`).emit('comment:typing', { userName, taskId });
    });

    socket.on('comment:stop_typing', ({ taskId }) => {
      socket.to(`task:${taskId}`).emit('comment:stop_typing', { taskId });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = { setupSocket };