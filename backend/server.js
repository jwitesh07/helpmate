// server.js
const dotenv = require("dotenv");
dotenv.config();

const http = require("http");
const express = require("express");
const { Server } = require("socket.io"); // ✅ Use socket.io Server class
const socketManager = require("./controllers/chat/socketManager"); // ✅ Adjust path if needed

// Handle unexpected errors
process.on("uncaughtException", (err) => {
  console.error("❌ UNCAUGHT EXCEPTION! Shutting down service...");
  console.error(err.name, err.message);
  process.exit(1);
});

// Express app
const app = require("./app");

// HTTP + Socket Server Setup
const port = process.env.PORT || 3000;
const server = http.createServer(app);

// ✅ Initialize Socket.IO Server
const io = new Server(server, {
  cors: {
    origin: "*", // ⚠️ For development; change to frontend origin later
    methods: ["GET", "POST"],
  },
});

// ✅ Initialize the custom socket logic
socketManager.init(io);

// Start listening
server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log("⚡ Socket.IO is active and listening...");
});

// Handle rejected promises safely
process.on("unhandledRejection", (err) => {
  console.error("💥 UNHANDLED REJECTION! Shutting down...");
  console.error(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});
