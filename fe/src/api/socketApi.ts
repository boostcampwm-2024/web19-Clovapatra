import { SOCKET_BASE_URL } from '@/constants/rules';
import { Room } from '@/types/roomTypes';
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@/types/socketTypes';
import { io, Socket } from 'socket.io-client';

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  `${SOCKET_BASE_URL}/rooms`
);

export const createRoom = async (
  roomName: string,
  hostNickname: string
): Promise<Room> => {
  return new Promise((resolve, reject) => {
    socket.emit('create_room', { roomName, hostNickname });

    socket.on('room_created', (room) => {
      resolve(room);
    });

    socket.on('error', (error) => {
      reject(error);
    });
  });
};
