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
import { ERROR_CODES, ERROR_MESSAGES } from '@/constants/errors';
import { useAudioPermission } from '@/hooks/useAudioPermission';
import { useDialogForm } from '@/hooks/useDialogForm';
import { useFormValidation } from '@/hooks/useFormValidation';
import { gameSocket } from '@/services/gameSocket';
import { signalingSocket } from '@/services/signalingSocket';
import { getCurrentRoomQuery } from '@/stores/queries/getCurrentRoomQuery';
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
  const { setCurrentRoom } = useRoomStore();
  const { data: currentRoom } = getCurrentRoomQuery(roomId);
  const setCurrentPlayer = useRoomStore((state) => state.setCurrentPlayer);
  const { requestPermission } = useAudioPermission();
  const { errors, validateForm, updateInput, setErrors, resetForm } =
    useFormValidation();
  const isFormValid = !errors.nickname && playerNickname.trim();

  const resetState = () => {
    setPlayerNickname('');
    setIsLoading(false);
    resetForm();
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetState();
      navigate('/');
    }
    onOpenChange(isOpen);
  };

  const handleCancel = () => {
    resetState();
    navigate('/');
    onOpenChange(false);
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPlayerNickname(value);
    updateInput('nickname', value);

    if (errors.nickname) {
      setErrors((prev) => ({ ...prev, nickname: '' }));
    }
  };

  const handleJoin = async () => {
    if (!validateForm(playerNickname)) return;

    try {
      setIsLoading(true);

      // 참가자 닉네임 저장
      sessionStorage.setItem('user_nickname', playerNickname.trim());
      setCurrentPlayer(playerNickname.trim());
      setCurrentRoom(currentRoom);

      // 게임 소켓 입장 시도
      gameSocket.connect();
      await gameSocket.joinRoom(roomId, playerNickname.trim());

      // 오디오 권한 요청
      const stream = await requestPermission();

      // 스트림 생성 후 방 입장
      signalingSocket.connect();
      await signalingSocket.setupLocalStream(stream);
      await signalingSocket.joinRoom(currentRoom, playerNickname.trim());

      // 성공시 게임방으로 이동
      onOpenChange(false);
      navigate(`/game/${roomId}`);
    } catch (error) {
      if (error === ERROR_CODES.duplicatedNickname) {
        setErrors((prev) => ({
          ...prev,
          nickname: ERROR_MESSAGES.duplicatedNickname,
        }));
        // 닉네임 중복 에러의 경우 홈 리다이렉션하지 않음
        gameSocket.disconnect();
        signalingSocket.disconnect();
      } else {
        // 다른 에러의 경우 홈으로 리다이렉션
        console.error('방 입장 실패:', error);
        gameSocket.disconnect();
        signalingSocket.disconnect();
        navigate('/');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 키보드 Enter 동작
  const { inputRefs, handleKeyDown } = useDialogForm({
    inputs: [
      {
        id: 'playerNickname',
        value: playerNickname,
        onChange: setPlayerNickname,
      },
    ],
    onSubmit: handleJoin,
    isSubmitDisabled: !playerNickname.trim() || isLoading,
    open,
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
              onChange={handleNicknameChange}
              placeholder="닉네임을 입력하세요"
              className="col-span-3"
              disabled={isLoading}
              ref={(el) => (inputRefs.current[0] = el)}
              onKeyDown={(e) => handleKeyDown(e, 0)}
            />
            {errors.nickname && (
              <p className="text-sm text-red-500">{errors.nickname}</p>
            )}
          </div>
        </div>
        <DialogFooter className="gap-2 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            취소
          </Button>
          <Button
            type="button"
            onClick={handleJoin}
            disabled={!isFormValid || isLoading}
          >
            입장하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JoinDialog;
