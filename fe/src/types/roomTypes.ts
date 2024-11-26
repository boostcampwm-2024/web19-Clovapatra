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
