import { Card, CardContent } from '@/components/ui/card';
import { FaCrown } from 'react-icons/fa6';
import VolumeBar from './VolumeBar';
import { PlayerProps } from '@/types/roomTypes';
import { isHost } from '@/utils/playerUtils';
import useRoomStore from '@/stores/zustand/useRoomStore';
import { Button } from '@/components/ui/button';

const Player = ({ playerNickname, isReady }: PlayerProps) => {
  const { currentRoom, currentPlayer } = useRoomStore();
  const isCurrentPlayerHost = currentPlayer === currentRoom?.hostNickname;
  const isPlayerHost = isHost(playerNickname);

  const handleKick = () => {
    // TODO: 강퇴 로직 구현
    console.log(`강퇴: ${playerNickname}`);
  };

  return (
    <Card className="h-full">
      <CardContent className="flex h-[4.7rem] items-center justify-between p-4">
        <div className="flex items-center gap-2">
          {isPlayerHost ? <FaCrown className="text-yellow-500" /> : ''}
          <span className="font-galmuri">{playerNickname}</span>
          {isReady && <span className="text-sm text-green-500">준비 완료</span>}
        </div>
        <div className="flex items-center gap-4">
          <VolumeBar />
          {isCurrentPlayerHost && !isPlayerHost && (
            <Button
              variant="outline"
              size="icon"
              className="font-galmuri text-muted-foreground hover:text-destructive"
              onClick={handleKick}
            >
              강퇴
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Player;
