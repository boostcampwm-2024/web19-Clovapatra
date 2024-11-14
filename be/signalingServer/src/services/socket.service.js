const RoomService = require("./room.service");

class SocketService {
  constructor(io) {
    this.io = io;
    this.roomService = new RoomService();
  }

  /**
   * 새로운 소켓 연결 처리
   * @param {Socket} socket - Socket.io 소켓 객체
   */
  handleConnection(socket) {
    console.log(`[SocketService] 새로운 사용자 연결: ${socket.id}`);

    // 방 참가 요청 처리
    socket.on("join_room", (data) => {
      const { roomId, sdp, candidates, deviceId } = data;
      console.log(`[SocketService] 사용자 ${socket.id}가 방 ${roomId} 참가 요청`);

      // 방에 사용자 추가
      socket.join(roomId);
      this.roomService.addUser(roomId, socket.id, {
        sdp,
        candidates,
        deviceId,
      });

      // 방의 모든 사용자에게 업데이트된 정보 전송
      this.broadcastRoomUpdate(roomId);
    });

    // 방 정보 수신 확인
    socket.on("room_info_received", (roomId) => {
      console.log(`[SocketService] 사용자 ${socket.id}가 방 ${roomId} 정보 수신 확인`);

      if (this.roomService.confirmReceived(roomId)) {
        // 모든 사용자가 정보를 받았으면 연결 계획 전송
        const plan = this.roomService.createConnectionPlan(roomId);
        this.io.to(roomId).emit("start_connections", plan);
      }
    });

    // WebRTC 시그널링 처리
    socket.on("webrtc_offer", (data) => {
      console.log(`[SocketService] WebRTC Offer: ${socket.id} -> ${data.toId}`);
      this.io.to(data.toId).emit("webrtc_offer", {
        sdp: data.sdp,
        fromId: socket.id,
      });
    });

    socket.on("webrtc_answer", (data) => {
      console.log(`[SocketService] WebRTC Answer: ${socket.id} -> ${data.toId}`);
      this.io.to(data.toId).emit("webrtc_answer", {
        sdp: data.sdp,
        fromId: socket.id,
      });
    });

    socket.on("webrtc_ice_candidate", (data) => {
      console.log(`[SocketService] ICE Candidate: ${socket.id} -> ${data.toId}`);
      this.io.to(data.toId).emit("webrtc_ice_candidate", {
        candidate: data.candidate,
        fromId: socket.id,
      });
    });

    // 연결 해제 처리
    socket.on("disconnect", () => {
      console.log(`[SocketService] 사용자 연결 해제: ${socket.id}`);
      const roomId = this.roomService.removeUser(socket.id);

      if (roomId) {
        this.io.to(roomId).emit("user_disconnected", socket.id);
        this.broadcastRoomUpdate(roomId);
      }
    });
  }

  /**
   * 방의 모든 사용자에게 업데이트된 정보 전송
   * @param {string} roomId - 방 ID
   */
  broadcastRoomUpdate(roomId) {
    const roomInfo = this.roomService.getRoomInfo(roomId);
    if (roomInfo) {
      console.log(`[SocketService] 방 ${roomId} 정보 브로드캐스트`);
      this.io.to(roomId).emit("room_info", roomInfo);
    }
  }
}

module.exports = SocketService;
