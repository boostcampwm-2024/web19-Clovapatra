export interface PlayerProps {
  playerNickname: string;
  isHost?: boolean;
  isAudioOn: boolean;
  isReady?: boolean;
}

export interface PlayerListProps {
  players: PlayerProps[];
}

export interface AudioControlProps {
  isOn: boolean;
}
