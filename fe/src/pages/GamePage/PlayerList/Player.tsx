import { Card, CardContent } from '@/components/ui/card';
import { PlayerProps } from '@/types/playerTypes';
import { BsMicFill, BsMicMuteFill } from 'react-icons/bs';
import { FaCrown } from 'react-icons/fa6';
import VolumeBar from './VolumeBar';

const Player = ({
  playerNickname,
  isHost = false,
  isAudioOn,
  isReady = false,
}: PlayerProps) => {
  return (
    <Card className="h-full">
      <CardContent className="flex items-center justify-between h-full p-4">
        <div className="flex items-center gap-2">
          {isHost && <FaCrown className="text-yellow-500" />}
          <span className="font-medium">{playerNickname}</span>
          {isReady && <span className="text-sm text-green-500">준비 완료</span>}
        </div>
        <VolumeBar isOn={isAudioOn} />
      </CardContent>
    </Card>
  );
};

export default Player;
