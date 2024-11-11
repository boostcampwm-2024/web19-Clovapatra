import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useRoomStore from '@/stores/zustand/useRoomStore';
import PlayerList from './PlayerList/PlayerList';
import { getRoomsQuery } from '@/stores/queries/getRoomsQuery';
import { useRoomActions } from '@/hooks/useRoomActions';

const GamePage = () => {
  const [isAudioOn, setIsAudioOn] = useState(true);
  const { roomId } = useParams();
  const { data: rooms } = getRoomsQuery();
  const { leaveRoom } = useRoomActions();
  const { currentRoom, setCurrentRoom } = useRoomStore();
  const navigate = useNavigate();

  // 방 정보 업데이트 및 WebRTC 연결 설정
  useEffect(() => {
    if (rooms && roomId && (!currentRoom || currentRoom.roomId !== roomId)) {
      const room = rooms.find((r) => r.roomId === roomId);
      if (room) {
        setCurrentRoom(room);
      } else {
        // 방을 찾을 수 없는 경우
        navigate('/');
      }
    }
  }, [rooms, roomId, currentRoom]);

  // 페이지 나가기 전에 연결 정리
  useEffect(() => {
    return () => {
      console.log('Cleaning up room connections');
      leaveRoom();
    };
  }, [leaveRoom]);

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
