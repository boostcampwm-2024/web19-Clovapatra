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
          // 1. 현재 방 설정
          setCurrentRoom(room);

          // 2. 소켓 연결
          gameSocket.connect();
          signalingSocket.connect();

          // 3. audioManager 설정 (소켓 연결 후)
          signalingSocket.setAudioManager(audioManager);

          // 4. 마이크 권한 요청 및 스트림 설정
          const stream = await requestPermission();
          signalingSocket.setupLocalStream(stream);

          // 5. 방 참가
          gameSocket.joinRoom(roomId, nickname);
          signalingSocket.joinRoom(room, nickname);
        }
      } catch (error) {
        console.error('Reconnection failed:', error);
        // 실패 시 audioManager 제거
        signalingSocket.setAudioManager(null);
      }
    };

    handleReconnect();

    // cleanup
    return () => {
      signalingSocket.setAudioManager(null);
    };
  }, [room, currentRoom, audioManager, requestPermission, roomId, nickname]);
};
