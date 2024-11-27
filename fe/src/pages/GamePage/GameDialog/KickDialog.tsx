import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { RoomDialogProps } from '@/types/roomTypes';
import { gameSocket } from '@/services/gameSocket';
import { cn } from '@/lib/utils';

interface KickDialogProps extends RoomDialogProps {
  playerNickname: string;
}

const KickDialog = ({
  open,
  onOpenChange,
  playerNickname,
}: KickDialogProps) => {
  const handleKick = () => {
    gameSocket.kickPlayer(playerNickname);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="font-galmuri sm:max-w-[22rem]">
        <AlertDialogHeader>
          <AlertDialogTitle>강제 퇴장 확인</AlertDialogTitle>
          <AlertDialogDescription>
            {playerNickname}님을 정말로 강제 퇴장 하시겠습니까?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleKick}
            className={cn('bg-destructive hover:bg-destructive/90')}
          >
            확인
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default KickDialog;
