import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useRoomStore from '@/stores/zustand/useRoomStore';
import PlayerList from './PlayerList/PlayerList';
import { getRoomsQuery } from '@/stores/queries/getRoomsQuery';

const GamePage = () => {
  const [isAudioOn, setIsAudioOn] = useState(true);
  const { roomId } = useParams();
  const { data: rooms } = getRoomsQuery();
  const { currentRoom, setCurrentRoom } = useRoomStore();

  useEffect(() => {
    if (rooms && roomId) {
      const room = rooms.find((r) => r.roomId === roomId);
      if (room) {
        setCurrentRoom(room);
      }
    }
  }, [rooms, roomId]);

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
