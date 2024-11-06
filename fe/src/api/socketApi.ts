import { Room } from '@/types/roomTypes';
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@/types/socketTypes';
import { io, Socket } from 'socket.io-client';

const SOCKET_BASE_URL = 'wss://game.clovapatra.com';

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  `${SOCKET_BASE_URL}/rooms`,
  {
    transports: ['websocket'],
    withCredentials: true,
  }
);

export const createRoom = async (
  roomName: string,
  hostNickname: string
): Promise<Room> => {
  return new Promise((resolve, reject) => {
    socket.emit('createRoom', { roomName, hostNickname });

    socket.on('roomCreated', (room) => {
      resolve(room);
    });

    socket.on('error', (error) => {
      reject(error);
    });
  });
};
