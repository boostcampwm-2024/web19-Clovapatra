import { Card, CardContent } from '@/components/ui/card';
import { FaCrown, FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa6';
import VolumeBar from './VolumeBar';
import { PlayerProps } from '@/types/roomTypes';
import { isHost } from '@/utils/playerUtils';
import useRoomStore from '@/stores/zustand/useRoomStore';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { signalingSocket } from '@/services/signalingSocket';
import KickDialog from '../GameDialog/KickDialog';

const Player = ({ playerNickname, isReady }: PlayerProps) => {
  const { currentRoom, currentPlayer } = useRoomStore();
  const isCurrentPlayerHost = currentPlayer === currentRoom?.hostNickname;
  const isPlayerHost = isHost(playerNickname);
  const isCurrentPlayer = currentPlayer === playerNickname;
  const [isMuted, setIsMuted] = useState(false);
  const [showKickDialog, setShowKickDialog] = useState(false);

  const handleKick = () => {
    setShowKickDialog(true);
  };

  const handleMuteToggle = () => {
    setIsMuted((prevMuted) => {
      const newMutedState = !prevMuted;
      const stream = signalingSocket.getLocalStream();

      if (stream) {
        const audioTrack = stream.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = !newMutedState;
        }
      }

      return newMutedState;
    });
  };

  return (
    <Card className={`h-full ${isReady ? 'bg-cyan-50' : ''}`}>
      <CardContent className="flex h-[4.7rem] items-center justify-between p-4">
        <div className="flex items-center gap-2">
          {isPlayerHost ? <FaCrown className="text-yellow-500" /> : ''}
          <span className="font-galmuri">{playerNickname}</span>
        </div>
        <div className="flex items-center gap-4">
          {isCurrentPlayer ? (
            <Button
              variant="outline"
              size="icon"
              onClick={handleMuteToggle}
              className={`rounded-full border ${
                isMuted
                  ? 'border-destructive text-destructive'
                  : 'border-cyan-500 text-cyan-500'
              } hover:bg-transparent`}
            >
              {isMuted ? (
                <FaMicrophoneSlash className="h-5 w-5 text-destructive" />
              ) : (
                <FaMicrophone className="h-5 w-5 text-cyan-500" />
              )}
            </Button>
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
