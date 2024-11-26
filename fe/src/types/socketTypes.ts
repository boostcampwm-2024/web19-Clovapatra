import { Room } from './roomTypes';

// 게임 서버 이벤트 타입
export interface ServerToClientEvents {
  roomCreated: (room: Room) => void;
  updateUsers: (players: string[]) => void;
  error: (error: { code: string; message: string }) => void;
  kicked: (playerNickname: string) => void;
  turnChanged: (turnData: TurnData) => void;
  voiceProcessingResult: (result: GameResultProps) => void;
  endGame: (rank: string[]) => void;
}

export interface ClientToServerEvents {
  createRoom: (data: { roomName: string; hostNickname: string }) => void;
  joinRoom: (data: { roomId: string; playerNickname: string }) => void;
  kickPlayer: (playerNickname: string) => void;
  setReady: () => void;
  startGame: () => void;
}

export interface TurnData {
  roomId: string;
  playerNickname: string;
  gameMode: string;
  timeLimit: number;
  lyrics: string;
}

export interface GameResultProps {
  playerNickname: string;
  result: string;
}

// 음성 처리 서버 이벤트 타입
export interface VoiceSocketEvents {
  audio_data: (buffer: ArrayBuffer) => void;
  start_recording: () => void;
  error: (error: Error) => void;
}
