const jwt = require("jsonwebtoken");

const setupSocket = (io) => {
  // ─── AUTH MIDDLEWARE ─────────────────────────────────────
  io.use((socket, next) => {
    try {
      const cookie = socket.handshake.headers.cookie;

      if (!cookie) return next(new Error("No cookie"));

      const token = cookie
        .split(";")
        .find((c) => c.trim().startsWith("accessToken="))
        ?.split("=")[1];

      if (!token) return next(new Error("No token"));

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      socket.userId = decoded.userId;
      socket.join(`user:${socket.userId}`);

      return next();
    } catch (err) {
      return next(new Error("Auth failed"));
    }
  });

  // ─── CONNECTION ──────────────────────────────────────────
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}, userId: ${socket.userId}`);

    // JOIN USER ROOM (notifications)
    if (socket.userId) {
      const room = `user:${socket.userId}`;
      socket.join(room);
      console.log(`Joined room: ${room}`);
    }

    // ─── PROJECT ROOM ───────────────────────────────────────
    socket.on("project:join", (projectId) => {
      socket.join(`project:${projectId}`);
      console.log(`Socket ${socket.id} joined project:${projectId}`);
    });

    socket.on("project:leave", (projectId) => {
      socket.leave(`project:${projectId}`);
    });

    // ─── TASK ROOM ───────────────────────────────────────────
    socket.on("task:join", (taskId) => {
      socket.join(`task:${taskId}`);
    });

    socket.on("task:leave", (taskId) => {
      socket.leave(`task:${taskId}`);
    });

    // ─── TYPING EVENTS ───────────────────────────────────────
    socket.on("comment:typing", ({ taskId, userName }) => {
      socket.to(`task:${taskId}`).emit("comment:typing", { userName, taskId });
    });

    socket.on("comment:stop_typing", ({ taskId }) => {
      socket.to(`task:${taskId}`).emit("comment:stop_typing", { taskId });
    });

    // DISCONNECT (proper logging)
    socket.on("disconnect", (reason) => {
      console.log(
        `Socket disconnected: ${socket.id}, userId: ${socket.userId}, reason: ${reason}`,
      );
    });
  });
};

module.exports = { setupSocket };
