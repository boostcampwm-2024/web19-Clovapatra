import { io, Socket } from 'socket.io-client';
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@/types/socketTypes';
import { Room } from '@/types/roomTypes';
import { SocketService } from './SocketService';
import useRoomStore from '@/stores/zustand/useRoomStore';
import { cleanupAudioStream, requestAudioStream } from './audioRequest';

const GAME_SOCKET_URL = 'wss://game.clovapatra.com/rooms';

class GameSocket extends SocketService {
  private audioStream: MediaStream | null = null;

  constructor() {
    super();
  }

  connect() {
    if (this.socket?.connected) return;

    const socket = io(GAME_SOCKET_URL, {
      transports: ['websocket'],
      withCredentials: true,
    }) as Socket<ServerToClientEvents, ClientToServerEvents>;

    this.setSocket(socket);
    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Game socket connected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Game socket connection error:', error);
    });

    this.socket.on('roomCreated', async (room: Room) => {
      try {
        // Zustand store 업데이트
        const store = useRoomStore.getState();
        store.setRooms([...store.rooms, room]);
        store.setCurrentRoom(room);
      } catch (error) {
        console.error('Failed to update rooms:', error);
      }
    });

    this.socket.on('updateUsers', async (players: string[]) => {
      try {
        const { currentRoom, setCurrentRoom } = useRoomStore.getState();

        if (currentRoom) {
          setCurrentRoom({
            ...currentRoom,
            players,
            hostNickname: players[0],
          });
        }
      } catch (error) {
        console.error('Failed to update users:', error);
      }
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      window.location.href = '/';
    });
  }

  createRoom(roomName: string, hostNickname: string) {
    // 마이크 권한 요청 후 방 생성
    requestAudioStream()
      .then((stream) => {
        this.audioStream = stream; // stream 저장
        this.socket?.emit('createRoom', { roomName, hostNickname });
      })
      .catch((error) => {
        console.error('Failed to access microphone:', error);
        throw error;
      });
  }

  joinRoom(roomId: string, playerNickname: string) {
    requestAudioStream()
      .then((stream) => {
        this.audioStream = stream; // stream 저장
        this.socket?.emit('joinRoom', { roomId, playerNickname });
      })
      .catch((error) => {
        console.error('Failed to access microphone:', error);
        throw error;
      });
  }

  // audio stream 정리를 위한 메서드
  cleanupAudio() {
    if (this.audioStream) {
      cleanupAudioStream(this.audioStream);
      this.audioStream = null;
    }
  }

  // disconnect 시 audio도 정리
  override disconnect() {
    this.cleanupAudio();
    super.disconnect();
  }
}

export const gameSocket = new GameSocket();
