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
import { JoinDialogProps } from '@/types/roomTypes';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const JoinDialog = ({ open, onOpenChange, roomId }: JoinDialogProps) => {
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const resetAndClose = () => {
    setNickname('');
    setIsLoading(false);
    onOpenChange(false);
  };

  const handleJoin = async () => {
    if (!nickname.trim()) return;

    try {
      setIsLoading(true);
      // TODO: 방 입장 로직 구현
      // await joinRoom(roomId, nickname.trim());

      resetAndClose();
      navigate(`/game/${roomId}`);
    } catch (error) {
      console.error('방 입장 실패:', error);
      // TODO: 에러 처리 토스트 메시지로
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
            <Label htmlFor="nickname" className="text-right">
              닉네임
            </Label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
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
            disabled={!nickname.trim() || isLoading}
          >
            입장하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JoinDialog;
