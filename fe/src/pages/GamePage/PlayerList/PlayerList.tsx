import { RULES } from '@/constants/rules';
import Player from './Player';
import { PlayerProps } from '@/types/roomTypes';

interface PlayerListProps {
  players: PlayerProps[];
}

const PlayerList = ({ players }: PlayerListProps) => {
  const emptySlots = RULES.maxPlayer - players.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {players.map((player) => (
        <Player key={player.playerNickname} {...player} />
      ))}
      {Array.from({ length: emptySlots }).map((_, index) => (
        <div
          key={`empty-${index}`}
          className="w-full h-[4.7rem] bg-white bg-opacity-60 border border-dashed rounded-lg"
        />
      ))}
    </div>
  );
};

export default PlayerList;
