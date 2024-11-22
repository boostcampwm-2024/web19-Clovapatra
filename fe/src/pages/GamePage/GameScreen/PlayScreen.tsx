import { useEffect } from 'react';
import { voiceSocket } from '@/services/voiceSocket';
import { signalingSocket } from '@/services/signalingSocket';
import useRoomStore from '@/stores/zustand/useRoomStore';
import useGameStore from '@/stores/zustand/useGameStore';

const PlayScreen = () => {
  const { currentRoom, currentPlayer } = useRoomStore();
  const { turnData } = useGameStore();

  useEffect(() => {
    const startRecording = async () => {
      if (
        !turnData ||
        turnData.playerNickname !== currentPlayer ||
        !currentRoom
      )
        return;

      try {
        console.log('Recording turn for:', turnData);

        await voiceSocket.startRecording(
          signalingSocket.getLocalStream(),
          currentRoom.roomId,
          currentPlayer
        );
        console.log('Voice recording started');

        setTimeout(() => {
          voiceSocket.disconnect();
          console.log(`Voice socket disconnected after ${turnData.timeLimit}s`);
        }, turnData.timeLimit * 1000);
      } catch (error) {
        console.error('Voice recording error:', error);
      }
    };

    startRecording();
  }, [turnData, currentPlayer, currentRoom]);

  return (
    <div className="h-[27rem] bg-muted rounded-lg flex items-center justify-center">
      {/* PlayScreen UI */}
    </div>
  );
};

export default PlayScreen;
