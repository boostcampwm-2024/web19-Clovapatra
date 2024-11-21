import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Gamepad2, CheckCircle2 } from 'lucide-react';
import useRoomStore from '@/stores/zustand/useRoomStore';
import { gameSocket } from '@/services/gameSocket';
import { voiceSocket } from '@/services/voiceSocket';
import { signalingSocket } from '../../../services/signalingSocket';
import useGameStore from '@/stores/zustand/useGameStore';

const GameScreen = () => {
  const [isReady, setIsReady] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const { currentRoom, currentPlayer, setCurrentPlayer } = useRoomStore();
  const { turnData } = useGameStore();

  useEffect(() => {
    if (!currentPlayer) {
      const nickname = sessionStorage.getItem('user_nickname');
      if (nickname) {
        setCurrentPlayer(nickname);
      }
    }
  }, [currentPlayer, setCurrentPlayer]);

  if (!currentRoom) return null;

  const isHost = currentPlayer === currentRoom.hostNickname;

  useEffect(() => {
    const startRecording = async () => {
      if (!turnData || turnData.playerNickname !== currentPlayer) return;

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

        setIsGameStarted((prev) => !prev);
      } catch (error) {
        console.error('Voice recording error:', error);
      }
    };

    startRecording();
  }, [turnData]);

  const canStartGame = useMemo(() => {
    if (!currentRoom) return false;
    if (currentRoom.players.length <= 1) return false;

    return currentRoom.players.every((player) => {
      const isPlayerHost = player.playerNickname === currentRoom.hostNickname;
      return isPlayerHost || player.isReady;
    });
  }, [currentRoom]);

  const toggleReady = () => {
    const newReadyState = !isReady;
    setIsReady(newReadyState);

    if (!isHost) {
      gameSocket.setReady();
    }
  };

  const handleGameStart = () => {
    if (!isHost || isGameStarted) return;

    try {
      console.log('Starting game...');
      gameSocket.startGame();
      setIsGameStarted((prev) => !prev);
      console.log('Game socket event emitted');
    } catch (error) {
      console.error('Game start error:', error);
    }
  };

  return (
    <div className="h-[27rem] bg-muted rounded-lg flex flex-col items-center justify-center space-y-4">
      {isHost ? (
        <Button
          size="lg"
          disabled={!canStartGame}
          onClick={handleGameStart}
          className="font-galmuri px-8 py-6 text-lg"
        >
          <Gamepad2 className="mr-2" />
          게임 시작
        </Button>
      ) : (
        <Button
          size="lg"
          onClick={toggleReady}
          className={`font-galmuri px-8 py-6 text-lg ${isReady ? 'bg-cyan-500 hover:bg-cyan-500' : ''}`}
        >
          <CheckCircle2 className="mr-2 h-5 w-5" />
          {isReady ? '준비 완료' : '게임 준비'}
        </Button>
      )}

      {!canStartGame && (
        <p className="font-galmuri text-sm text-muted-foreground mt-2">
          모든 플레이어가 준비를 완료해야 게임을 시작할 수 있습니다.
        </p>
      )}
    </div>
  );
};

export default GameScreen;
