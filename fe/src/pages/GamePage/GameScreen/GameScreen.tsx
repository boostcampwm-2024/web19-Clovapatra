import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Gamepad2, CheckCircle2 } from 'lucide-react';
import useRoomStore from '@/stores/zustand/useRoomStore';
import { gameSocket } from '@/services/gameSocket';

const GameScreen = () => {
  const [isReady, setIsReady] = useState(false);
  const { currentRoom, currentPlayer, setCurrentPlayer } = useRoomStore();

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

  const allPlayersReady = currentRoom.players
    .slice(1)
    .every((player) => player.isReady);

  const toggleReady = () => {
    const newReadyState = !isReady;
    setIsReady(newReadyState);

    gameSocket.setReady();
  };

  const handleGameStart = () => {
    // TODO: 게임 시작 후 화면 중앙 버튼 display: none
    gameSocket.startGame();
  };

  return (
    <div className="h-[27rem] bg-muted rounded-lg flex flex-col items-center justify-center space-y-4">
      {isHost ? (
        <Button
          size="lg"
          disabled={!allPlayersReady}
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

      {!allPlayersReady && (
        <p className="font-galmuri text-sm text-muted-foreground mt-2">
          모든 플레이어가 준비를 완료해야 게임을 시작할 수 있습니다.
        </p>
      )}
    </div>
  );
};

export default GameScreen;
