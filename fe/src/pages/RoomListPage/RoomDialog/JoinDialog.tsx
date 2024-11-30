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
import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!open) {
      setPlayerNickname('');
      setIsLoading(false);
      resetForm();
    }
  }, [open]);

  const resetAndClose = () => {
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

      try {
        // 참가자 닉네임 저장
        sessionStorage.setItem('user_nickname', playerNickname.trim());
        setCurrentPlayer(playerNickname.trim());
        setCurrentRoom(currentRoom);

        // 게임 소켓 입장 시도
        gameSocket.connect();
        await gameSocket.joinRoom(roomId, playerNickname.trim());

        // 오디오 권한 요청 -> 허용하지 않을 시 입장 불가
        const stream = await requestPermission();

        // 스트림 생성 후 방 입장
        signalingSocket.connect();
        await signalingSocket.setupLocalStream(stream);
        await signalingSocket.joinRoom(currentRoom, playerNickname.trim());

        // 다이얼로그 닫고 페이지 이동
        onOpenChange(false);
        navigate(`/game/${roomId}`);
      } catch (error) {
        if (error === ERROR_CODES.duplicatedNickname) {
          setErrors((prev) => ({
            ...prev,
            nickname: ERROR_MESSAGES.duplicatedNickname,
          }));
        }

        // 소켓 연결 정리
        gameSocket.disconnect();
        signalingSocket.disconnect();
      }
    } catch (error) {
      console.error('방 입장 실패:', error);
      if (error === ERROR_CODES.validation) {
        console.error('[ERROR] 사용자 입력값 ERROR', error);
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
            onClick={resetAndClose}
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
