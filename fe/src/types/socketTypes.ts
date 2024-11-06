import { Room } from './roomTypes';

export interface ServerToClientEvents {
  roomCreated: (room: Room) => void;
  roomJoined: (room: Room) => void;
  roomLeft: (room: Room) => void;
  error: (error: { code: string; message: string }) => void;
}

export interface ClientToServerEvents {
  createRoom: (data: { roomName: string; hostNickname: string }) => void;
  joinRoom: (data: { roomId: string; userNickname: string }) => void;
  leaveRoom: (data: { roomId: string }) => void;
}
