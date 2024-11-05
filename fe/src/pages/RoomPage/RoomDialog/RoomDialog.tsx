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
import { RoomDialogProps } from '@/types/room';
import { useState } from 'react';

const RoomDialog = ({ open, onOpenChange }: RoomDialogProps) => {
  const [roomName, setRoomName] = useState('');
  const [nickname, setNickname] = useState('');

  const addRoom = useRoomStore((state) => state.addRoom);

  const handleSubmit = () => {
    addRoom(roomName.trim(), nickname.trim());
    setRoomName('');
    setNickname('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nickname" className="text-right">
              닉네임
            </Label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
              }}
              placeholder="닉네임을 입력하세요"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter className="gap-2 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setRoomName('');
              setNickname('');
              onOpenChange(false);
            }}
          >
            취소
          </Button>
          <Button type="button" onClick={handleSubmit}>
            확인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoomDialog;
