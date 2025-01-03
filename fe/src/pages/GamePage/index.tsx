import { useEffect, useState } from 'react';
import useRoomStore from '@/stores/zustand/useRoomStore';
import PlayerList from './PlayerList/PlayerList';
import { Button } from '@/components/ui/button';
import ExitDialog from './GameDialog/ExitDialog';
import { useReconnect } from '@/hooks/useReconnect';
import { useBackExit } from '@/hooks/useBackExit';
import { NotFound } from '@/pages/NotFoundPage';
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
  const { kickedPlayer, setKickedPlayer } = useRoomStore();
  const currentRoom = useRoomStore((state) => state.currentRoom);
  const audioManager = useAudioManager();
  const { roomId } = useParams();
  const { data: room } = getCurrentRoomQuery(roomId);
  const nickname = sessionStorage.getItem('user_nickname');

  useReconnect({ currentRoom });
  useBackExit({ setShowExitDialog });

  useEffect(() => {
    if (room && !currentRoom) {
      if (!nickname) {
        setShowJoinDialog(true);
      }
    }
  }, [room, currentRoom, nickname]);

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
        position: 'top-right',
        autoClose: 1000,
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

  const handleCopyLink = () => {
    // 현재 URL을 구성
    const currentURL = `${window.location.origin}/game/${roomId}`;

    // 클립보드에 복사
    navigator.clipboard
      .writeText(currentURL)
      .then(() => {
        toast.success('링크가 클립보드에 복사되었습니다!', {
          position: 'top-right',
          autoClose: 1000,
          style: {
            width: '25rem',
            fontFamily: 'Galmuri11, monospace',
          },
        });
      })
      .catch((err) => {
        console.error('링크 복사 실패:', err);
        toast.error('링크 복사에 실패했습니다.', {
          position: 'top-right',
          autoClose: 1000,
          style: {
            fontFamily: 'Galmuri11, monospace',
          },
        });
      });
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
    <div className="game-page game-wrapper">
      <div className="flex flex-col items-center justify-center overflow-y-auto p-6 mt-3 min-h-screen">
        <div className="w-full max-w-7xl px-4">
          <div className="space-y-6">
            <GameScreen />
            <PlayerList
              players={currentRoom.players.map((player) => ({
                playerNickname: player.playerNickname,
                isReady: player.isReady,
                isDead: player.isDead,
                isLeft: player.isLeft,
              }))}
            />
          </div>

          <div className="flex mt-6">
            <div className="ml-auto">
              <Button
                onClick={handleCopyLink}
                className="font-galmuri border mr-4"
              >
                ✨링크 복사✨
              </Button>
              <Button onClick={handleClickExit} className="font-galmuri border">
                나가기
              </Button>
            </div>
          </div>
          <ExitDialog open={showExitDialog} onOpenChange={setShowExitDialog} />
        </div>
      </div>
    </div>
  );
};

export default GamePage;
