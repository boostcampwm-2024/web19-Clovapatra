export interface RoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface JoinDialogProps extends RoomDialogProps {
  roomId: string;
}

export interface Room {
  roomId: string;
  roomName: string;
  hostNickname: string;
  players: string[];
  status: 'waiting' | 'playing';
}

export interface GameRoomProps {
  room: Room;
  onJoinRoom: (roomId: string) => void;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface JoinGameRoomResult {
  room: Room;
  stream: MediaStream;
}

export interface RoomStore {
  rooms: Room[];
  currentRoom: Room | null;
  addRoom: (roomName: string, hostNickname: string) => Promise<string>;
  joinGameRoom: (roomId: string, playerNickname: string) => void;
}
