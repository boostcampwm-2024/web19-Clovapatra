const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const config = require("./config/app.config");
const SocketService = require("./services/socket.service");

const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: config.cors,
});

const socketService = new SocketService(io);

io.on("connection", (socket) => {
  socketService.handleConnection(socket);
});

httpServer.listen(config.port, () => {
  console.log(`Signaling server is running on port ${config.port}`);
});
