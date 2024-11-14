import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useRoomStore from '@/stores/zustand/useRoomStore';
import PlayerList from './PlayerList/PlayerList';
import { Button } from '@/components/ui/button';
import ExitDialog from './GameDialog/ExitDialog';
import { useBackExit } from '@/hooks/useBackExit';
import { useReconnect } from '@/hooks/useReconnect';

const GamePage = () => {
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const { currentRoom } = useRoomStore();

  useReconnect();

  useBackExit({
    onBack: () => setShowExitDialog(true),
  });

  const handleClickExit = () => {
    setShowExitDialog(true);
  };

  if (!currentRoom) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen relative p-4">
      <div className="space-y-6">
        <div className="h-[27rem] bg-muted rounded-lg flex items-center justify-center">
          Game Screen
        </div>
        <PlayerList
          players={currentRoom.players.map((playerNickname) => ({
            playerNickname,
            isHost: playerNickname === currentRoom.hostNickname,
            isAudioOn,
            isReady: false,
          }))}
        />
      </div>
      <div className="flex mt-6">
        <Button onClick={handleClickExit} className="ml-auto">
          나가기
        </Button>
      </div>
      <ExitDialog
        open={showExitDialog}
        onOpenChange={setShowExitDialog}
      ></ExitDialog>
    </div>
  );
};

export default GamePage;
