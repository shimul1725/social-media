const { Server } = require("socket.io");

let io;
const onlineUsers = new Map(); // userId -> socket.id

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    socket.on("addUser", (userId) => {
      onlineUsers.set(userId, socket.id);
      io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
    });

    socket.on("sendMessage", ({ senderId, receiverId, text, _id, createdAt, sender }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", {
          _id,
          senderId,
          receiverId,
          text,
          createdAt,
          sender,
        });
      }
    });

    socket.on("typing", ({ senderId, receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userTyping", { senderId });
      }
    });

    socket.on("stopTyping", ({ senderId, receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userStopTyping", { senderId });
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
    });
  });

  return io;
};

// Send a real-time event to one specific user, if they're online
const emitToUser = (userId, event, data) => {
  const socketId = onlineUsers.get(userId.toString());
  if (socketId && io) {
    io.to(socketId).emit(event, data);
  }
};

module.exports = { initSocket, emitToUser };