import { useEffect, useState } from 'react';
import useRoomStore from '@/stores/zustand/useRoomStore';
import PlayerList from './PlayerList/PlayerList';
import { Button } from '@/components/ui/button';
import ExitDialog from './GameDialog/ExitDialog';
import { useReconnect } from '@/hooks/useReconnect';
import { useBackExit } from '@/hooks/useBackExit';
import { NotFound } from '@/components/common/NotFound';
import GameScreen from './GameScreen/GameScreen';
import { useAudioManager } from '@/hooks/useAudioManager';
import { signalingSocket } from '@/services/signalingSocket';

const GamePage = () => {
  const [showExitDialog, setShowExitDialog] = useState(false);
  const { currentRoom } = useRoomStore();
  const audioManager = useAudioManager();

  useReconnect({ currentRoom });
  useBackExit({ setShowExitDialog });

  useEffect(() => {
    signalingSocket.setAudioManager(audioManager);

    return () => {
      signalingSocket.setAudioManager(null);
    };
  }, [audioManager]);

  const handleClickExit = () => {
    setShowExitDialog(true);
  };

  if (!currentRoom) {
    return <NotFound />;
  }

  return (
    <div className="h-screen relative p-4">
      <div className="space-y-6">
        <GameScreen />
        <PlayerList
          players={currentRoom.players.map((player) => ({
            playerNickname: player.playerNickname,
            isReady: false,
          }))}
        />
      </div>
      <div className="flex mt-6">
        <Button onClick={handleClickExit} className="font-galmuri ml-auto">
          나가기
        </Button>
      </div>
      <ExitDialog open={showExitDialog} onOpenChange={setShowExitDialog} />
    </div>
  );
};

export default GamePage;
