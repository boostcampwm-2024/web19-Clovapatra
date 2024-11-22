class RoomService {
  constructor() {
    // 방 정보를 저장하는 Map
    // Map<roomId, RoomInfo>
    this.rooms = new Map();
  }

  /**
   * 방 정보 구조
   * {
   *   users: Map<socketId, UserInfo>
   *   // 모든 사용자가 방 정보를 받았는지 확인하는 카운터
   *   receivedInfoCount: number,
   * }
   *
   * UserInfo 구조
   * {
   *   socketId: string,
   *   sdp: RTCSessionDescription,
   *   candidates: RTCIceCandidate[],
   *   deviceId: string, // 오디오 장치 ID
   *   playerNickname: string, // 닉네임
   *   timestamp: number // 마지막 업데이트 시간
   * }
   */

  /**
   * 방에 사용자 추가
   * @param {string} roomId - 방 ID
   * @param {string} socketId - 소켓 ID
   * @param {Object} userInfo - 사용자 정보 (SDP, ICE candidates 등)
   */
  addUser(roomId, socketId, userInfo) {
    console.log(`[RoomService] 사용자 ${socketId}가 방 ${roomId}에 참가 시도`);

    if (!this.rooms.has(roomId)) {
      console.log(`[RoomService] 새로운 방 ${roomId} 생성`);
      this.rooms.set(roomId, {
        users: new Map(),
        receivedInfoCount: 0,
      });
    }

    const room = this.rooms.get(roomId);
    room.users.set(socketId, {
      ...userInfo,
      timestamp: Date.now(),
    });

    console.log(`[RoomService] 방 ${roomId}의 현재 사용자 수: ${room.users.size}`);
    return Array.from(room.users.values());
  }

  /**
   * 방에서 사용자 제거
   * @param {string} socketId - 소켓 ID
   */
  removeUser(socketId) {
    console.log(`[RoomService] 사용자 ${socketId} 제거 시도`);

    for (const [roomId, room] of this.rooms) {
      if (room.users.has(socketId)) {
        room.users.delete(socketId);
        console.log(`[RoomService] 사용자 ${socketId}가 방 ${roomId}에서 제거됨`);

        if (room.users.size === 0) {
          this.rooms.delete(roomId);
          console.log(`[RoomService] 빈 방 ${roomId} 삭제`);
        }
        return roomId;
      }
    }
    return null;
  }

  /**
   * 사용자 정보 업데이트 (SDP, ICE candidate 등)
   * @param {string} roomId - 방 ID
   * @param {string} socketId - 소켓 ID
   * @param {Object} updates - 업데이트할 정보
   */
  updateUser(roomId, socketId, updates) {
    console.log(`[RoomService] 사용자 ${socketId} 정보 업데이트`);

    const room = this.rooms.get(roomId);
    if (!room) return false;

    const userInfo = room.users.get(socketId);
    if (!userInfo) return false;

    room.users.set(socketId, {
      ...userInfo,
      ...updates,
      timestamp: Date.now(),
    });

    console.log(`[RoomService] 사용자 ${socketId} 정보 업데이트 완료`);
    return true;
  }

  /**
   * 방 정보 수신 확인
   * @param {string} roomId - 방 ID
   * @returns {boolean} - 모든 사용자가 정보를 받았는지 여부
   */
  confirmReceived(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    room.receivedInfoCount++;
    console.log(`[RoomService] 방 ${roomId}의 정보 수신 확인: ${room.receivedInfoCount}/${room.users.size}`);

    if (room.receivedInfoCount >= room.users.size) {
      room.receivedInfoCount = 0;
      return true;
    }
    return false;
  }

  /**
   * P2P 연결 계획 생성
   * @param {string} roomId - 방 ID
   * @returns {Array<{from: string, to: string}>} - 연결 계획
   */
  createConnectionPlan(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return [];

    const users = Array.from(room.users.keys());
    const connections = [];

    // 모든 사용자를 서로 연결
    for (let i = 0; i < users.length; i++) {
      for (let j = i + 1; j < users.length; j++) {
        connections.push({
          from: users[i],
          to: users[j],
        });
      }
    }

    console.log(`[RoomService] 방 ${roomId}의 연결 계획 생성:`, connections);
    return connections;
  }

  /**
   * 방의 모든 사용자 정보 반환
   * @param {string} roomId - 방 ID
   */
  getRoomInfo(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    return {
      users: Array.from(room.users.entries()).map(([socketId, info]) => ({
        socketId,
        ...info,
      })),
      userMappings: Array.from(room.users.entries()).reduce((mappings, [socketId, info]) => {
        mappings[info.playerNickname] = socketId;
        return mappings;
      }, {}),
    };
  }
}

module.exports = RoomService;
