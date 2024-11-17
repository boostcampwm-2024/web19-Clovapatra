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
import { gameSocket } from '@/services/gameSocket';
import { signalingSocket } from '@/services/signalingSocket';
import useRoomStore from '@/stores/zustand/useRoomStore';
import { RoomDialogProps } from '@/types/roomTypes';
import { useNavigate } from 'react-router-dom';

const ExitDialog = ({ open, onOpenChange }: RoomDialogProps) => {
  const { setCurrentRoom } = useRoomStore();
  const navigate = useNavigate();

  const handleExit = () => {
    gameSocket.disconnect();
    signalingSocket.disconnect();

    setCurrentRoom(null);

    navigate('/');
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="font-galmuri sm:max-w-[22rem]">
        <AlertDialogHeader>
          <AlertDialogTitle>방 나가기</AlertDialogTitle>
          <AlertDialogDescription>
            정말로 방을 나가시겠습니까?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction onClick={handleExit}>확인</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ExitDialog;
