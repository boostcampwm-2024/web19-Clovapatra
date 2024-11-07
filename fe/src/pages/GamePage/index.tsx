import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useRoomStore from '@/store/useRoomStore';
import PlayerList from './PlayerList/PlayerList';
import { getRooms } from '@/api/api';

const GamePage = () => {
  const [isAudioOn, setIsAudioOn] = useState(true);
  const { roomId } = useParams();
  const { currentRoom, updateCurrentRoom } = useRoomStore();

  useEffect(() => {
    const initializeRoom = async () => {
      if (roomId) {
        try {
          const rooms = await getRooms();
          const room = rooms.find((r) => r.roomId === roomId);
          if (room) updateCurrentRoom(room);
        } catch (error) {
          console.error('Failed to restore room info:', error);
        }
      }
    };

    if (!currentRoom || currentRoom.roomId !== roomId) initializeRoom();
  }, [roomId, currentRoom]);

  console.log('GamePage render:', { currentRoom, roomId });

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
