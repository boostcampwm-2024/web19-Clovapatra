export interface RoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface Room {
  id: string;
  name: string;
  creator: string;
  players: string[];
  isGameStarted: boolean;
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
  addRoom: (roomName: string, nickname: string) => void;
}
