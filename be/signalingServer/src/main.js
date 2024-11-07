const express = require('express');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const config = require('./config/app.config');
const SocketService = require('./services/socket.service');

const app = express();

// Static files
app.use(express.static(path.join(__dirname, 'static')));

// Root route handler
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: config.cors
});

const socketService = new SocketService(io);

io.on('connection', (socket) => {
    socketService.handleConnection(socket);
});

httpServer.listen(config.port, () => {
    console.log(`Signaling server is running on port ${config.port}`);
    console.log(`Test client available at https://test2.clovapatra.com`);
});