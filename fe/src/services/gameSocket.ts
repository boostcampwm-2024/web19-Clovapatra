import { io, Socket } from 'socket.io-client';
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@/types/socketTypes';
import { Room } from '@/types/roomTypes';
import { SocketService } from './SocketService';
import useRoomStore from '@/stores/zustand/useRoomStore';

const GAME_SOCKET_URL = 'wss://game.clovapatra.com/rooms';

class GameSocket extends SocketService {
  constructor() {
    super();
  }

  connect() {
    if (this.socket?.connected) return;

    const socket = io(GAME_SOCKET_URL, {
      transports: ['websocket'],
      withCredentials: false,
    }) as Socket<ServerToClientEvents, ClientToServerEvents>;

    this.setSocket(socket);
    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // 소켓 모니터링
    this.socket.on('connect', () => {
      console.log('Game socket connected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Game socket connection error:', error);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      window.location.href = '/';
    });

    this.socket.on('roomCreated', (room: Room) => {
      const store = useRoomStore.getState();
      store.setRooms([...store.rooms, room]);
      store.setCurrentRoom(room);
    });

    this.socket.on('updateUsers', (players: string[]) => {
      const { currentRoom, setCurrentRoom } = useRoomStore.getState();

      if (currentRoom) {
        setCurrentRoom({
          ...currentRoom,
          players,
          hostNickname: players[0],
        });
      }
    });
  }

  createRoom(roomName: string, hostNickname: string) {
    this.socket?.emit('createRoom', { roomName, hostNickname });
  }

  joinRoom(roomId: string, playerNickname: string) {
    this.socket?.emit('joinRoom', { roomId, playerNickname });
  }
}

export const gameSocket = new GameSocket();