export interface PlayerProps {
  playerNickname: string;
  isReady: boolean;
}

export interface Room {
  roomId: string;
  roomName: string;
  hostNickname: string;
  players: PlayerProps[];
  status: 'waiting' | 'playing';
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
