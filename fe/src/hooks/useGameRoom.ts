import { gameSocket } from '@/services/gameSocket';
import { getRoomsQuery } from '@/stores/queries/getRoomsQuery';
import useRoomStore from '@/stores/zustand/useRoomStore';
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useGameRoom = (roomId: string | undefined) => {
  const navigate = useNavigate();
  const setCurrentRoom = useRoomStore((state) => state.setCurrentRoom);
  const { data: rooms, isLoading } = getRoomsQuery();

  // 초기 설정 및 소켓 연결 관리
  useEffect(() => {
    // 로딩 중이면 리턴
    if (isLoading) return;

    // roomId나 rooms가 없으면 홈으로
    if (!roomId || !rooms) {
      navigate('/', { replace: true });
      return;
    }

    const room = rooms.find((r) => r.roomId === roomId);
    if (!room) {
      navigate('/', { replace: true });
      return;
    }

    // 소켓 연결 및 초기 설정
    const initializeRoom = async () => {
      try {
        // 1. 소켓 연결
        if (!gameSocket.socket?.connected) {
          gameSocket.connect();
        }

        // 2. 방 설정
        setCurrentRoom(room);

        // 3. 소켓 재연결 (새로고침 대응)
        await gameSocket.joinRoom(
          roomId,
          room.players[room.players.length - 1]
        );
      } catch (error) {
        console.error('Failed to initialize room:', error);
        navigate('/', { replace: true });
      }
    };

    initializeRoom();

    // Cleanup
    return () => {
      if (gameSocket.socket?.connected) {
        gameSocket.disconnect();
      }
      setCurrentRoom(null);
    };
  }, [roomId, rooms, isLoading]);

  // 방 나가기
  const leaveRoom = useCallback(() => {
    if (gameSocket.socket?.connected) {
      gameSocket.disconnect();
    }
    setCurrentRoom(null);
    navigate('/', { replace: true });
  }, [navigate, setCurrentRoom]);

  return {
    leaveRoom,
  };
};
