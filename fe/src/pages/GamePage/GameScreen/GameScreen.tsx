import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Gamepad2, CheckCircle2 } from 'lucide-react';
import useRoomStore from '@/stores/zustand/useRoomStore';

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

  // 방장을 제외한 나머지 플레이어들의 준비 상태 체크
  const allPlayersReady = currentRoom.players
    .slice(1) // 첫 번째 플레이어(방장)를 제외
    .every((player) => player.isReady);

  const handleReady = () => {
    setIsReady(true);
    // TODO: 서버에 준비 상태 전송 로직 추가 필요
  };

  const handleGameStart = () => {
    // TODO: 게임 시작 로직 추가 필요
  };

  // 방장인지 아닌지로 버튼 분기
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
          disabled={isReady}
          onClick={handleReady}
          className={`font-galmuri px-8 py-6 text-lg ${isReady ? 'bg-green-500 hover:bg-green-500' : ''}`}
        >
          <CheckCircle2 className="mr-2 h-5 w-5" />
          {isReady ? '준비 완료' : '게임 준비'}
        </Button>
      )}

      {isHost && !allPlayersReady && (
        <p className="font-galmuri text-sm text-muted-foreground mt-2">
          모든 플레이어가 준비를 완료해야 게임을 시작할 수 있습니다.
        </p>
      )}
    </div>
  );
};

export default GameScreen;
