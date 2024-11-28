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
import { useAudioPermission } from '@/hooks/useAudioPermission';
import { useDialogForm } from '@/hooks/useDialogForm';
import { useFormValidation } from '@/hooks/useFormValidation';
import { gameSocket } from '@/services/gameSocket';
import { signalingSocket } from '@/services/signalingSocket';
import useRoomStore from '@/stores/zustand/useRoomStore';
import { RoomDialogProps } from '@/types/roomTypes';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateDialog = ({ open, onOpenChange }: RoomDialogProps) => {
  const [roomName, setRoomName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hostNickname, setHostNickname] = useState('');
  const navigate = useNavigate();
  const setCurrentPlayer = useRoomStore((state) => state.setCurrentPlayer);
  const { errors, validateForm, updateInput } = useFormValidation();
  const { requestPermission } = useAudioPermission();
  const isFormValid =
    !errors.nickname &&
    !errors.roomName &&
    roomName.trim() &&
    hostNickname.trim();

  const resetAndClose = () => {
    setRoomName('');
    setHostNickname('');
    setIsLoading(false);
    onOpenChange(false);
  };

  // 입력값 변경 핸들러
  const handleRoomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRoomName(value);
    updateInput('roomName', value);
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHostNickname(value);
    updateInput('nickname', value);
  };

  const handleSubmit = async () => {
    if (!validateForm(hostNickname, roomName)) return;

    try {
      setIsLoading(true);

      // 오디오 권한 요청 -> 허용하지 않을 시 입장 불가
      const stream = await requestPermission();

      // 방장 닉네임 저장
      sessionStorage.setItem('user_nickname', hostNickname.trim());
      setCurrentPlayer(hostNickname.trim());

      // 소켓 연결
      gameSocket.connect();
      signalingSocket.connect();

      // 스트림 생성 후 방 생성
      await signalingSocket.setupLocalStream(stream);

      // 한 번만 실행되는 이벤트 리스너 등록
      gameSocket.socket?.once('roomCreated', async (room) => {
        try {
          // 시그널링 서버 접속
          await signalingSocket.joinRoom(room, hostNickname.trim());
          // 페이지 이동
          navigate(`/game/${room.roomId}`);
        } catch (error) {
          console.error('시그널링 서버 접속 실패:', error);
          alert('[ERROR] 음성 채팅 연결에 실패했습니다.');

          if (error === 'ValidationFailed') {
            console.error('[ERROR] 사용자 입력값 ERROR', error);
          }
        }
      });

      gameSocket.createRoom(roomName.trim(), hostNickname.trim());

      resetAndClose();
    } catch (error) {
      console.error('방 생성 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 키보드 Enter 동작
  const { inputRefs, handleKeyDown } = useDialogForm({
    inputs: [
      { id: 'roomName', value: roomName, onChange: setRoomName },
      { id: 'nickname', value: hostNickname, onChange: setHostNickname },
    ],
    onSubmit: handleSubmit,
    isSubmitDisabled: !roomName.trim() || !hostNickname.trim() || isLoading,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="font-galmuri sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="mb-2">방 만들기</DialogTitle>
          <DialogDescription>
            방 제목과 사용하실 닉네임을 입력해주세요.
          </DialogDescription>
          <DialogDescription className="text-red-500">
            마이크 권한을 허용하지 않으면 게임방에 입장할 수 없습니다.
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
              onChange={handleRoomNameChange}
              placeholder="방 제목을 입력하세요"
              className="col-span-3"
              disabled={isLoading}
              ref={(el) => (inputRefs.current[0] = el)}
              onKeyDown={(e) => handleKeyDown(e, 0)}
            />
            {errors.roomName && (
              <p className="text-sm text-red-500">{errors.roomName}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="nickname" className="text-right">
              닉네임
            </Label>
            <Input
              id="nickname"
              value={hostNickname}
              onChange={handleNicknameChange}
              placeholder="닉네임을 입력하세요"
              className="col-span-3"
              disabled={isLoading}
              ref={(el) => (inputRefs.current[1] = el)}
              onKeyDown={(e) => handleKeyDown(e, 1)}
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
            onClick={handleSubmit}
            disabled={!isFormValid || isLoading}
          >
            확인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDialog;
