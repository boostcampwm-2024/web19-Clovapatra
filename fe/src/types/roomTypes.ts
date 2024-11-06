export interface RoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface RoomStore {
  rooms: Room[];
  currentRoom: Room | null;
  addRoom: (roomName: string, hostNickname: string) => void;
}
