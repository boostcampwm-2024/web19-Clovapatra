export interface PlayerProps {
  nickname: string;
  isCreator?: boolean;
  isAudioOn: boolean;
  isReady?: boolean;
}

export interface PlayerListProps {
  players: PlayerProps[];
}

export interface AudioControlProps {
  isOn: boolean;
}
