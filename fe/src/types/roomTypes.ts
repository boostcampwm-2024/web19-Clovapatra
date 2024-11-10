export interface Room {
  roomId: string;
  roomName: string;
  hostNickname: string;
  players: string[];
  status: 'waiting' | 'playing';
}

export interface RoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
