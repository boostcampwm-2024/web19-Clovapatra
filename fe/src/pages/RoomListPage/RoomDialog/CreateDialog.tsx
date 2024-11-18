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

const CreateDialog = ({ open, onOpenChange }: RoomDialogProps) => {
  const [roomName, setRoomName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hostNickname, setHostNickname] = useState('');
  const navigate = useNavigate();
  const currentRoom = useRoomStore((state) => state.currentRoom);
  const setCurrentPlayer = useRoomStore((state) => state.setCurrentPlayer);

  useEffect(() => {
    if (currentRoom) {
      navigate(`/game/${currentRoom.roomId}`);
      signalingSocket.joinRoom(currentRoom);
    }
  }, [currentRoom, navigate]);

  const resetAndClose = () => {
    setRoomName('');
    setHostNickname('');
    setIsLoading(false);
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (!roomName.trim() || !hostNickname.trim()) return;

    try {
      setIsLoading(true);

      // 방장 닉네임 저장
      sessionStorage.setItem('user_nickname', hostNickname.trim());

      setCurrentPlayer(hostNickname.trim());

      gameSocket.connect();
      signalingSocket.connect();

      gameSocket.createRoom(roomName.trim(), hostNickname.trim());

      // 방 생성 후 currentRoom이 설정될 때까지 대기
      resetAndClose();
    } catch (error) {
      console.error('방 생성 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="font-galmuri sm:max-w-md">
        <DialogHeader>
          <DialogTitle>방 만들기</DialogTitle>
          <DialogDescription>
            방 제목과 사용하실 닉네임을 입력해주세요.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="roomName" className="text-right">
              방 제목
            </Label>
            <Input
              id="roomName"
              value={roomName}
              onChange={(e) => {
                setRoomName(e.target.value);
              }}
              placeholder="방 제목을 입력하세요"
              className="col-span-3"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nickname" className="text-right">
              닉네임
            </Label>
            <Input
              id="nickname"
              value={hostNickname}
              onChange={(e) => {
                setHostNickname(e.target.value);
              }}
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
            onClick={handleSubmit}
            disabled={!roomName.trim() || !hostNickname.trim() || isLoading}
          >
            확인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDialog;
