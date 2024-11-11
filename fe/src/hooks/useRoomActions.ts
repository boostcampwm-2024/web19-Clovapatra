import { useCallback } from 'react';
import { gameSocket } from '@/services/gameSocket';
import { signalingSocket } from '@/services/signalingSocket';

export const useRoomActions = () => {
  const createRoom = useCallback(
    async (roomName: string, hostNickname: string) => {
      try {
        // 1. 게임 소켓 연결
        gameSocket.connect();

        // 2. 오디오 스트림 설정 및 방 생성
        const stream = await gameSocket.createRoom(roomName, hostNickname);

        // 3. 시그널링 소켓 설정
        signalingSocket.connect();
        signalingSocket.setLocalStream(stream);

        // 4. 방 생성 성공 시 시그널링 룸 참여
        const onRoomCreated = (room) => {
          signalingSocket.joinSignalingRoom(room.roomId, hostNickname);
          gameSocket.socket?.off('roomCreated', onRoomCreated);
        };

        gameSocket.socket?.on('roomCreated', onRoomCreated);
      } catch (error) {
        console.error('방 생성 실패:', error);
        throw error;
      }
    },
    []
  );

  const joinRoom = useCallback(
    async (roomId: string, playerNickname: string) => {
      try {
        // 1. 게임 소켓 연결
        gameSocket.connect();

        // 2. 오디오 스트림 설정 및 방 참여
        const stream = await gameSocket.joinRoom(roomId, playerNickname);

        // 3. 시그널링 소켓 설정
        signalingSocket.connect();
        signalingSocket.setLocalStream(stream);

        // 4. 방 참여 성공 시 시그널링 룸 참여
        const onUpdateUsers = (players) => {
          if (players.includes(playerNickname)) {
            signalingSocket.joinSignalingRoom(roomId, playerNickname);
            gameSocket.socket?.off('updateUsers', onUpdateUsers);
          }
        };

        gameSocket.socket?.on('updateUsers', onUpdateUsers);
      } catch (error) {
        console.error('방 참여 실패:', error);
        throw error;
      }
    },
    []
  );

  const leaveRoom = useCallback(() => {
    signalingSocket.disconnect();
    gameSocket.disconnect();
  }, []);

  const toggleAudio = useCallback((enabled: boolean) => {
    if (gameSocket['#audioStream']) {
      gameSocket['#audioStream'].getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }, []);

  return {
    createRoom,
    joinRoom,
    leaveRoom,
    toggleAudio,
  };
};
