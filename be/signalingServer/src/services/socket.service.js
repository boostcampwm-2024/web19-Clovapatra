const redisService = require('./redis.service');

class SocketService {
  constructor(io) {
    this.io = io;
    this.rooms = new Map(); // roomId -> Set of socket ids
  }

  async handleConnection(socket) {
    console.log(`Client connected: ${socket.id}`);

    socket.on('join', async (data) => this.handleJoin(socket, data));
    socket.on('offer', (data) => this.handleOffer(socket, data));
    socket.on('answer', (data) => this.handleAnswer(socket, data));
    socket.on('ice-candidate', (data) => this.handleIceCandidate(socket, data));
    socket.on('disconnect', () => this.handleDisconnect(socket));
  }

  async handleJoin(socket, { roomId, userId }) {
    try {
      console.log(`User ${userId} joining room ${roomId}`);

      // Verify room exists in Redis
      const roomData = await redisService.getRoomData(roomId);
      if (!roomData) {
        socket.emit('error', 'Room not found');
        return;
      }

      // Join the socket.io room
      socket.join(roomId);
      
      // Initialize room if it doesn't exist in memory
      if (!this.rooms.has(roomId)) {
        this.rooms.set(roomId, new Set());
      }
      
      const room = this.rooms.get(roomId);
      
      // Store user info
      socket.userId = userId;
      socket.roomId = roomId;
      room.add(socket.id);

      // Notify existing peers to create offers
      room.forEach(peerId => {
        if (peerId !== socket.id) {
          this.io.to(peerId).emit('new-peer', {
            peerId: socket.id,
            userId: userId
          });
        }
      });

      // Send list of existing peers to new user
      const existingPeers = [];
      room.forEach(peerId => {
        if (peerId !== socket.id) {
          const peerSocket = this.io.sockets.sockets.get(peerId);
          existingPeers.push({
            peerId: peerId,
            userId: peerSocket.userId
          });
        }
      });
      
      socket.emit('room-joined', { peers: existingPeers });
    } catch (error) {
      console.error('Error handling join:', error);
      socket.emit('error', 'Failed to join room');
    }
  }

  handleOffer(socket, { targetId, sdp }) {
    console.log(`Forwarding offer from ${socket.id} to ${targetId}`);
    this.io.to(targetId).emit('offer', {
      peerId: socket.id,
      userId: socket.userId,
      sdp
    });
  }

  handleAnswer(socket, { targetId, sdp }) {
    console.log(`Forwarding answer from ${socket.id} to ${targetId}`);
    this.io.to(targetId).emit('answer', {
      peerId: socket.id,
      sdp
    });
  }

  handleIceCandidate(socket, { targetId, candidate }) {
    console.log(`Forwarding ICE candidate from ${socket.id} to ${targetId}`);
    this.io.to(targetId).emit('ice-candidate', {
      peerId: socket.id,
      candidate
    });
  }

  async handleDisconnect(socket) {
    console.log(`Client disconnected: ${socket.id}`);
    
    if (socket.roomId) {
      const room = this.rooms.get(socket.roomId);
      if (room) {
        room.delete(socket.id);
        
        // Notify remaining peers about disconnection
        room.forEach(peerId => {
          this.io.to(peerId).emit('peer-disconnected', {
            peerId: socket.id
          });
        });

        // Clean up empty room from memory
        if (room.size === 0) {
          this.rooms.delete(socket.roomId);
        }
      }
    }
  }
}

module.exports = SocketService;