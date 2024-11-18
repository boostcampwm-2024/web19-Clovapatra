import { Card, CardContent } from '@/components/ui/card';
import { FaCrown } from 'react-icons/fa6';
import VolumeBar from './VolumeBar';
import { PlayerProps } from '@/types/roomTypes';
import { isHost } from '@/utils/playerUtils';

const Player = ({ playerNickname, isReady }: PlayerProps) => {
  return (
    <Card className="h-full">
      <CardContent className="flex h-[4.7rem] items-center justify-between p-4">
        <div className="flex items-center gap-2">
          {isHost(playerNickname) ? (
            <FaCrown className="text-yellow-500" />
          ) : (
            ''
          )}
          <span className="font-galmuri">{playerNickname}</span>
          {isReady && <span className="text-sm text-green-500">준비 완료</span>}
        </div>
        <VolumeBar />
      </CardContent>
    </Card>
  );
};

export default Player;
