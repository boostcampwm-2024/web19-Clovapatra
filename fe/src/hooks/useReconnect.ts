import { gameSocket } from '@/services/gameSocket';
import { signalingSocket } from '@/services/signalingSocket';
import { getCurrentRoomQuery } from '@/stores/queries/getCurrentRoomQuery';
import useRoomStore from '@/stores/zustand/useRoomStore';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

export const useReconnect = () => {
  const { roomId } = useParams();
  const { currentRoom, setCurrentRoom } = useRoomStore();
  const nickname = sessionStorage.getItem('user_nickname');
  const { data: room } = getCurrentRoomQuery(roomId);

  useEffect(() => {
    if (room && !currentRoom) {
      console.log('Reconnecting with room:', room);

      setCurrentRoom(room);
      gameSocket.connect();
      signalingSocket.connect();
      gameSocket.joinRoom(roomId, nickname);
      signalingSocket.joinRoom(room);
    }
  }, [room]);
};
