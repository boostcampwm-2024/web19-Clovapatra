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
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import { getCurrentRoomQuery } from '@/stores/queries/getCurrentRoomQuery';
import JoinDialog from '../RoomListPage/RoomDialog/JoinDialog';

const GamePage = () => {
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const { currentRoom, kickedPlayer, setKickedPlayer } = useRoomStore();
  const audioManager = useAudioManager();
  const { roomId } = useParams();
  const { data: room } = getCurrentRoomQuery(roomId);
  const nickname = sessionStorage.getItem('user_nickname');

  useEffect(() => {
    if (room && !currentRoom) {
      if (!nickname) {
        setShowJoinDialog(true);
      }
    }
  }, [room, currentRoom, nickname]);

  useReconnect({ currentRoom });
  useBackExit({ setShowExitDialog });

  // 오디오 매니저 설정
  useEffect(() => {
    signalingSocket.setAudioManager(audioManager);

    return () => {
      signalingSocket.setAudioManager(null);
    };
  }, [audioManager]);

  // 강퇴 알림 처리 추가
  useEffect(() => {
    if (kickedPlayer) {
      toast.error(`${kickedPlayer}님이 강퇴되었습니다.`, {
        position: 'bottom-right',
        autoClose: 2000,
        style: {
          fontFamily: 'Galmuri11, monospace',
        },
      });

      setKickedPlayer(null);
    }
  }, [kickedPlayer, setKickedPlayer, toast]);

  const handleClickExit = () => {
    setShowExitDialog(true);
  };

  if (!currentRoom) {
    return <NotFound />;
  }

  if (showJoinDialog) {
    return (
      <JoinDialog
        open={true}
        onOpenChange={setShowJoinDialog}
        roomId={roomId}
      />
    );
  }

  return (
    <div className="h-screen relative p-4">
      <div className="space-y-6">
        <GameScreen />
        <PlayerList
          players={currentRoom.players.map((player) => ({
            playerNickname: player.playerNickname,
            isReady: player.isReady,
            isMuted: player.isMuted,
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
