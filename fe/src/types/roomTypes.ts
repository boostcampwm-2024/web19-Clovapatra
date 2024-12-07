export interface CreateRoomOptions {
  maxPlayers: number;
  gameMode: GameMode;
  randomModeRatio?: number; // 0-100 사이의 값, 클레오파트라 모드의 비율
}

export enum GameMode {
  CLEOPATRA = 'CLEOPATRA',
  PRONUNCIATION = 'PRONUNCIATION',
  RANDOM = 'RANDOM',
}

export interface PlayerProps {
  playerNickname: string;
  isReady: boolean;
  isDead: boolean;
  isLeft: boolean;
}

export interface Room {
  roomId: string;
  roomName: string;
  hostNickname: string;
  players: PlayerProps[];
  status: 'waiting' | 'playing';
  maxPlayers: number; // maxPlayers 필드 추가
  gameMode: GameMode;
  randomModeRatio?: number;
}

export interface RoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  rooms: T[];
  pagination: PaginationData;
}
