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
import { RoomDialogProps } from '@/types/room';

const RoomDialog = ({ open, onOpenChange }: RoomDialogProps) => {
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
              placeholder="닉네임을 입력하세요"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter className="gap-2 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            취소
          </Button>
          <Button type="button">확인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoomDialog;
