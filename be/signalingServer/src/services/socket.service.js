class SocketService {
  constructor(io) {
    this.io = io;
  }

  async handleConnection(socket) {
    console.log(`New user connected: ${socket.id}`);

    // Handle room joining requests
    socket.on("join", (roomId) => {
      // Get current number of clients in the room
      const numberOfClients = this.io.sockets.adapter.rooms.get(roomId)?.size || 0;

      if (numberOfClients === 0) {
        // If room is empty, create new room
        socket.join(roomId);
        socket.emit("room_created", roomId);
        console.log(`Room ${roomId} created by ${socket.id}`);
      } else if (numberOfClients >= 1) {
        // If room exists, join the room
        socket.join(roomId);

        // Get list of all clients in the room
        const clients = Array.from(this.io.sockets.adapter.rooms.get(roomId));
        socket.emit("room_joined", {
          socketId: socket.id,
          numberOfClients,
          clientList: clients,
          roomId,
        });
        console.log(`User ${socket.id} joined room ${roomId}`);
      }
    });

    // Handle call initiation
    socket.on("start_call", (roomId) => {
      const clients = Array.from(this.io.sockets.adapter.rooms.get(roomId));
      socket.to(roomId).emit("start_call", {
        fromId: socket.id,
        clientCount: clients.length,
        clientList: clients,
        roomId,
      });
    });

    // Handle WebRTC signaling
    socket.on("webrtc_offer", (event) => {
      this.io.to(event.toId).emit("webrtc_offer", {
        sdp: event.sdp,
        fromId: socket.id,
      });
    });

    socket.on("webrtc_answer", (event) => {
      this.io.to(event.toId).emit("webrtc_answer", {
        sdp: event.sdp,
        fromId: socket.id,
      });
    });

    socket.on("webrtc_ice_candidate", (event) => {
      this.io.to(event.toId).emit("webrtc_ice_candidate", {
        candidate: event.candidate,
        fromId: socket.id,
      });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      this.io.sockets.emit("user_disconnected", socket.id);
      console.log(`User disconnected: ${socket.id}`);
    });
  }
}

module.exports = SocketService;
