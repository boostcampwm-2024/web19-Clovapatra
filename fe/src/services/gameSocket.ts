import { io, Socket } from 'socket.io-client';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  TurnData,
} from '@/types/socketTypes';
import { PlayerProps, Room } from '@/types/roomTypes';
import { SocketService } from './SocketService';
import useRoomStore from '@/stores/zustand/useRoomStore';
import { ENV } from '@/config/env';

class GameSocket extends SocketService {
  constructor() {
    super();
  }

  connect() {
    if (this.socket?.connected) return;

    const socket = io(ENV.GAME_SERVER_URL, {
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
    });

    this.socket.on('roomCreated', (room: Room) => {
      const store = useRoomStore.getState();
      store.setRooms([...store.rooms, room]);
      store.setCurrentRoom(room);
    });

    this.socket.on('updateUsers', (players: PlayerProps[]) => {
      const { currentRoom, setCurrentRoom } = useRoomStore.getState();

      if (currentRoom) {
        setCurrentRoom({
          ...currentRoom,
          players,
          hostNickname: players[0].playerNickname,
        });
      }
    });

    this.socket.on('kicked', (playerNickname: string) => {
      const {
        currentRoom,
        currentPlayer,
        setCurrentRoom,
        setCurrentPlayer,
        setKickedPlayer,
      } = useRoomStore.getState();

      if (!currentRoom) return;

      if (currentPlayer === playerNickname) {
        setCurrentRoom(null);
        setCurrentPlayer(null);
        window.location.href = '/';
        return;
      }

      setKickedPlayer(playerNickname);
    });

    this.socket.on('turnChanged', (turnData: TurnData) => {
      console.log(turnData);
    });
  }

  createRoom(roomName: string, hostNickname: string) {
    this.socket?.emit('createRoom', { roomName, hostNickname });
  }

  joinRoom(roomId: string, playerNickname: string) {
    this.socket?.emit('joinRoom', { roomId, playerNickname });
  }

  kickPlayer(playerNickname: string) {
    this.socket?.emit('kickPlayer', playerNickname);
  }

  setReady() {
    this.socket?.emit('setReady');
  }

  startGame() {
    this.socket?.emit('startGame');
  }
}

export const gameSocket = new GameSocket();
