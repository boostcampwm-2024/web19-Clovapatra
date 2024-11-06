import { Room } from './roomTypes';

export interface ServerToClientEvents {
  room_created: (room: Room) => void;
  room_joined: (room: Room) => void;
  room_left: (room: Room) => void;
  error: (error: { code: string; message: string }) => void;
}

export interface ClientToServerEvents {
  create_room: (data: { roomName: string; hostNickname: string }) => void;
  join_room: (data: { roomId: string; userNickname: string }) => void;
  leave_room: (data: { roomId: string }) => void;
}
