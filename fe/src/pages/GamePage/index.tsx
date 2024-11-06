import { useState } from 'react';
import { useParams } from 'react-router-dom';
import useRoomStore from '@/store/useRoomStore';
import PlayerList from './PlayerList/PlayerList';

const GamePage = () => {
  const [isAudioOn, setIsAudioOn] = useState(true);
  const { currentRoom } = useRoomStore();

  if (!currentRoom) return null;

  return (
    <div className="h-screen relative p-4">
      <div className="space-y-6">
        <div className="h-[26rem] bg-muted rounded-lg flex items-center justify-center">
          Game Screen
        </div>
        <PlayerList
          players={currentRoom.players.map((playerNickname) => ({
            playerNickname,
            isHost: playerNickname === currentRoom.hostNickname,
            isAudioOn,
            isReady: false,
          }))}
        />
      </div>
    </div>
  );
};

export default GamePage;
