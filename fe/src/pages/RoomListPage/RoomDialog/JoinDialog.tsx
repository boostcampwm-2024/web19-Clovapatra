import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAudioPermission } from '@/hooks/useAudioPermission';
import { gameSocket } from '@/services/gameSocket';
import { signalingSocket } from '@/services/signalingSocket';
import useRoomStore from '@/stores/zustand/useRoomStore';
import { RoomDialogProps } from '@/types/roomTypes';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface JoinDialogProps extends RoomDialogProps {
  roomId: string;
}

const JoinDialog = ({ open, onOpenChange, roomId }: JoinDialogProps) => {
  const [playerNickname, setPlayerNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { rooms, setCurrentRoom } = useRoomStore();
  const currentRoom = rooms.find((room) => room.roomId === roomId);
  const setCurrentPlayer = useRoomStore((state) => state.setCurrentPlayer);
  const { requestPermission } = useAudioPermission();

  const resetAndClose = () => {
    setPlayerNickname('');
    setIsLoading(false);
    onOpenChange(false);
  };

  const handleJoin = async () => {
    if (!playerNickname.trim()) return;

    try {
      setIsLoading(true);

      // 오디오 권한 요청 -> 허용하지 않을 시 입장 불가
      const stream = await requestPermission();

      // 참가자 닉네임 저장
      sessionStorage.setItem('user_nickname', playerNickname.trim());
      setCurrentRoom(currentRoom);
      setCurrentPlayer(playerNickname.trim());

      gameSocket.connect();
      signalingSocket.connect();

      // 스트림 생성 후 방 입장
      await signalingSocket.setupLocalStream(stream);
      await signalingSocket.joinRoom(currentRoom, playerNickname.trim());
      gameSocket.joinRoom(roomId, playerNickname.trim());

      resetAndClose();
      navigate(`/game/${roomId}`);
    } catch (error) {
      console.error('방 입장 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="font-galmuri sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="mb-2">방 입장하기</DialogTitle>
          <DialogDescription>사용하실 닉네임을 입력해주세요.</DialogDescription>
          <DialogDescription className="text-red-500">
            마이크 권한을 허용하지 않으면 게임방에 입장할 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="playerNickname" className="text-right">
              닉네임
            </Label>
            <Input
              id="playerNickname"
              value={playerNickname}
              onChange={(e) => setPlayerNickname(e.target.value)}
              placeholder="닉네임을 입력하세요"
              className="col-span-3"
              disabled={isLoading}
            />
          </div>
        </div>
        <DialogFooter className="gap-2 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={resetAndClose}
            disabled={isLoading}
          >
            취소
          </Button>
          <Button
            type="button"
            onClick={handleJoin}
            disabled={!playerNickname.trim() || isLoading}
          >
            입장하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JoinDialog;
