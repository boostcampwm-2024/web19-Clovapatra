import { useState } from 'react';
import useRoomStore from '@/stores/zustand/useRoomStore';
import PlayerList from './PlayerList/PlayerList';
import { Button } from '@/components/ui/button';
import ExitDialog from './GameDialog/ExitDialog';
import { useReconnect } from '@/hooks/useReconnect';
import { useBackExit } from '@/hooks/useBackExit';
import { NotFound } from '@/components/common/NotFound';

const GamePage = () => {
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const { currentRoom } = useRoomStore();

  useReconnect({ currentRoom });
  useBackExit({ setShowExitDialog });

  const handleClickExit = () => {
    setShowExitDialog(true);
  };

  if (!currentRoom) {
    return <NotFound />;
  }

  return (
    <div className="h-screen relative p-4">
      <div className="space-y-6">
        <div className="h-[27rem] bg-muted rounded-lg flex items-center justify-center">
          Game Screen
        </div>
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
