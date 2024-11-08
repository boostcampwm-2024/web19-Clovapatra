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
import useRoomStore from '@/store/useRoomStore';
import { JoinDialogProps } from '@/types/roomTypes';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const JoinDialog = ({ open, onOpenChange, roomId }: JoinDialogProps) => {
  const [playerNickname, setPlayerNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const joinGameRoom = useRoomStore((state) => state.joinGameRoom);

  const resetAndClose = () => {
    setPlayerNickname('');
    setIsLoading(false);
    onOpenChange(false);
  };

  const handleJoin = async () => {
    if (!playerNickname.trim()) return;

    try {
      setIsLoading(true);
      joinGameRoom(roomId, playerNickname.trim());

      // stream은 별도의 상태 관리 필요 (예: audio store)

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>방 입장하기</DialogTitle>
          <DialogDescription>사용하실 닉네임을 입력해주세요.</DialogDescription>
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
