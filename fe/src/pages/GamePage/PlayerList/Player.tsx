import { Card, CardContent } from '@/components/ui/card';
import { FaCrown, FaMicrophoneSlash, FaRegFaceSmile } from 'react-icons/fa6';
import VolumeBar from './VolumeBar';
import { PlayerProps } from '@/types/roomTypes';
import { isHost } from '@/utils/playerUtils';
import useRoomStore from '@/stores/zustand/useRoomStore';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { signalingSocket } from '@/services/signalingSocket';
import KickDialog from '../GameDialog/KickDialog';
import { gameSocket } from '@/services/gameSocket';
import MikeButton from '@/components/common/MikeButton';
import useGameStore from '@/stores/zustand/useGameStore';

const Player = ({ playerNickname, isReady, isDead, isLeft }: PlayerProps) => {
  const { currentRoom, currentPlayer } = useRoomStore();
  // 본인이 방장인지
  const isCurrentPlayerHost = currentPlayer === currentRoom?.hostNickname;
  // 방장인지 참가자인지
  const isPlayerHost = isHost(playerNickname);
  // playerNickname이 본인인지
  const isCurrentPlayer = currentPlayer === playerNickname;
  // 본인의 음소거 상태 (마이크 버튼 토글)
  const [isCurrentPlayerMuted, setIsCurrentPlayerMuted] = useState(false);
  // 음소거한 사용자 다른 사용자에게 표시하기 위한 상태
  const [isMuted, setIsMuted] = useState(false);
  const [showKickDialog, setShowKickDialog] = useState(false);
  const muteStatus = useGameStore((state) => state.muteStatus);

  useEffect(() => {
    setIsMuted(muteStatus[playerNickname]);
  }, [muteStatus]);

  const handleKick = () => {
    setShowKickDialog(true);
  };

  const toggleMute = () => {
    if (!isCurrentPlayer) return;

    const newMutedState = !isCurrentPlayerMuted;
    const stream = signalingSocket.getLocalStream();

    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !newMutedState;
      }
    }

    setIsCurrentPlayerMuted(newMutedState);
    gameSocket.setMute();
  };

  return (
    <Card className={`h-full ${!isPlayerHost && isReady ? 'bg-cyan-50' : ''}`}>
      <CardContent className="relative flex h-[4.7rem] items-center justify-between p-4">
        <div className="flex items-center gap-2">
          {isPlayerHost ? (
            <FaCrown className="text-yellow-500 mr-1" />
          ) : (
            <FaRegFaceSmile className="mr-1" />
          )}
          <span className="font-galmuri">{playerNickname}</span>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 ml-1 mr-1">
          {isLeft ? (
            <img
              className="w-16 h-10 md:w-20 md:h-12 lg:w-[6.875rem] lg:h-[3.625rem]"
              src="https://i.imgur.com/JCNlJnB.png"
              alt="탈주"
            />
          ) : isDead ? (
            <img
              className="w-16 h-10 md:w-20 md:h-12 lg:w-[6.875rem] lg:h-[3.625rem]"
              src="https://i.imgur.com/kcsoaeY.png"
              alt="탈락"
            />
          ) : (
            ''
          )}
        </div>

        <div className="flex items-center gap-4">
          {isCurrentPlayer ? (
            <MikeButton isMuted={isCurrentPlayerMuted} onToggle={toggleMute} />
          ) : isMuted ? (
            <FaMicrophoneSlash className="h-5 w-5" />
          ) : (
            <VolumeBar playerNickname={playerNickname} />
          )}
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

      <KickDialog
        open={showKickDialog}
        onOpenChange={setShowKickDialog}
        playerNickname={playerNickname}
      />
    </Card>
  );
};

export default Player;
