import { Card, CardContent } from '@/components/ui/card';
import { FaCrown, FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa6';
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

const Player = ({ playerNickname, isReady }: PlayerProps) => {
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
      <CardContent className="flex h-[4.7rem] items-center justify-between p-4">
        <div className="flex items-center gap-2">
          {isPlayerHost ? <FaCrown className="text-yellow-500" /> : ''}
          <span className="font-galmuri">{playerNickname}</span>
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
