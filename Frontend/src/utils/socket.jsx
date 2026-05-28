import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io('/', {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

  }
  return socket;
};



export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};