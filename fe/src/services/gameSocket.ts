import { JoinGameRoomResult, Room } from '@/types/roomTypes';
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@/types/socketTypes';
import { io, Socket } from 'socket.io-client';

const SOCKET_BASE_URL = 'wss://game.clovapatra.com';

const gameSocket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  `${SOCKET_BASE_URL}/rooms`,
  {
    transports: ['websocket'],
    withCredentials: true,
  }
);

// 소켓 연결 상태 모니터링
gameSocket.on('connect', () => {
  console.log('Socket connected');
});

gameSocket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

gameSocket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
});

export const createRoom = async (
  roomName: string,
  hostNickname: string
): Promise<Room> => {
  return new Promise((resolve, reject) => {
    gameSocket.emit('createRoom', { roomName, hostNickname });

    gameSocket.on('roomCreated', (room) => {
      resolve(room);
    });

    gameSocket.on('error', (error) => {
      reject(error);
    });
  });
};

export const joinRoom = async (
  roomId: string,
  playerNickname: string
): Promise<JoinGameRoomResult> => {
  if (!gameSocket.connected) {
    throw new Error('서버와 연결이 되지 않았습니다.');
  }

  console.log('Attempting to join room:', { roomId, playerNickname });

  return new Promise((resolve, reject) => {
    let isResolved = false;

    // updateUsers 이벤트 핸들러
    const handleUpdateUsers = (players: string[]) => {
      console.log('Received updateUsers:', players);

      // 첫 업데이트에서만 resolve 하도록
      if (!isResolved) {
        isResolved = true;
        cleanup();

        // Room 객체 구성
        const room: Room = {
          roomId,
          roomName: `Room ${roomId}`, // 서버에서 따로 제공하지 않음
          hostNickname: players[0], // 첫 번째 플레이어를 호스트로 가정
          players: players,
          status: 'waiting',
        };

        resolve({
          room,
          stream: new MediaStream(),
        });
      }
    };

    const handleError = (error: { code: string; message: string }) => {
      console.error('Error joining room:', error);
      cleanup();
      reject(error);
    };

    const cleanup = () => {
      gameSocket.off('updateUsers', handleUpdateUsers);
      gameSocket.off('error', handleError);
      clearTimeout(timeoutId);
    };

    // 이벤트 리스너 등록
    gameSocket.on('updateUsers', handleUpdateUsers);
    gameSocket.on('error', handleError);

    // 방 입장 요청
    gameSocket.emit('joinRoom', { roomId, playerNickname });

    // 타임아웃 설정
    const timeoutId = setTimeout(() => {
      if (!isResolved) {
        cleanup();
        reject(new Error('서버 응답 시간이 초과되었습니다.'));
      }
    }, 5000);
  });
};
