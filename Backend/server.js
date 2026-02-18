const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./src/DataBase/connection.db');
const { setupSocket } = require('./socket');

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Connect to DB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL ,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', require('./src/routes/auth.route'));
app.use('/api/projects', require('./src/routes/projects.route'));
app.use('/api/tasks', require('./src/routes/task.route'));
app.use('/api/comments', require('./src/routes/comments.route'));
app.use('/api/notifications', require('./src/routes/notification.route'));
app.use('/api/users', require('./src/routes/user.route'));

// Setup socket
setupSocket(io);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});