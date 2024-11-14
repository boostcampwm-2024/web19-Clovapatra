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
import { gameSocket } from '@/services/gameSocket';
import { signalingSocket } from '@/services/signalingSocket';
import useRoomStore from '@/stores/zustand/useRoomStore';
import { RoomDialogProps } from '@/types/roomTypes';
import { useEffect, useState } from 'react';
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

  const resetAndClose = () => {
    setPlayerNickname('');
    setIsLoading(false);
    onOpenChange(false);
  };

  const handleJoin = async () => {
    if (!playerNickname.trim()) return;

    try {
      setIsLoading(true);
      gameSocket.connect();
      signalingSocket.connect();

      setCurrentRoom(currentRoom);
      gameSocket.joinRoom(roomId, playerNickname.trim());
      await signalingSocket.joinRoom(currentRoom);

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
