import { gameSocket } from '@/services/gameSocket';
import { signalingSocket } from '@/services/signalingSocket';
import { getCurrentRoomQuery } from '@/stores/queries/getCurrentRoomQuery';
import useRoomStore from '@/stores/zustand/useRoomStore';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAudioPermission } from './useAudioPermission';
import { useAudioManager } from './useAudioManager';

export const useReconnect = ({ currentRoom }) => {
  const { roomId } = useParams();
  const { setCurrentRoom } = useRoomStore();
  const nickname = sessionStorage.getItem('user_nickname');
  const { data: room } = getCurrentRoomQuery(roomId);
  const { requestPermission } = useAudioPermission();
  const audioManager = useAudioManager();

  useEffect(() => {
    const handleReconnect = async () => {
      try {
        if (room && !currentRoom) {
          // 현재 방 설정
          setCurrentRoom(room);

          // 게임 소켓 연결
          if (!gameSocket.socket?.connected) {
            gameSocket.connect();
            await gameSocket.joinRoom(roomId, nickname);
          }

          // 마이크 권한 요청 및 스트림 설정
          const stream = await requestPermission();

          if (!signalingSocket.socket?.connected) {
            console.log('Connecting signalingSocket...');
            signalingSocket.connect();
            await signalingSocket.setupLocalStream(stream);
          }

          // audioManager 설정 (소켓 연결 후)
          if (!signalingSocket.hasAudioManager()) {
            signalingSocket.setAudioManager(audioManager);
          }

          // 시그널링 방 참가
          await signalingSocket.joinRoom(room, nickname);
        }
      } catch (error) {
        console.error('Reconnection failed:', error);
        // 실패 시 audioManager 제거
        signalingSocket.setAudioManager(null);

        if (error === 'GameAlreadyInProgress') {
          sessionStorage.setItem('gameInProgressError', 'true');
          window.location.href = '/rooms';
        }
      }
    };

    handleReconnect();

    return () => {
      signalingSocket.setAudioManager(null);
    };
  }, [room, currentRoom, audioManager, requestPermission, roomId, nickname]);
};
