import { Room } from './roomTypes';

// 게임 서버 이벤트 타입
export interface ServerToClientEvents {
  roomCreated: (room: Room) => void;
  updateUsers: (players: string[]) => void;
  error: (error: { code: string; message: string }) => void;
}

export interface ClientToServerEvents {
  createRoom: (data: { roomName: string; hostNickname: string }) => void;
  joinRoom: (data: { roomId: string; playerNickname: string }) => void;
}

export interface TurnData {
  roomId: string;
  playerNickname: string;
  gameMode: string;
  timeLimit: number;
  lyrics: string;
}
