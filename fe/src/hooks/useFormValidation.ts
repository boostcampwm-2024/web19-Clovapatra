import { validateNickname, validateRoomName } from '@/utils/validator';
import { useEffect, useState } from 'react';
import { useDebounce } from './useDebounce';

export const useFormValidation = () => {
  const [errors, setErrors] = useState({
    nickname: '',
    roomName: '',
  });

  // 입력값을 디바운스 처리할 state
  const [inputs, setInputs] = useState({
    nickname: '',
    roomName: '',
  });

  // 입력값을 디바운스 처리할 state
  const debouncedInputs = useDebounce(inputs, 200);

  // 디바운스된 입력값이 변경될 때마다 유효성 검증
  useEffect(() => {
    const newErrors = {
      nickname:
        debouncedInputs.nickname === ''
          ? '닉네임을 입력해주세요.'
          : validateNickname(debouncedInputs.nickname),
      roomName:
        debouncedInputs.roomName === ''
          ? '방 제목을 입력해주세요.'
          : validateRoomName(debouncedInputs.roomName),
    };
    setErrors(newErrors);
  }, [debouncedInputs]);

  // 입력값 업데이트 함수
  const updateInput = (field: 'nickname' | 'roomName', value: string) => {
    setInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 최종 제출 시 유효성 검증
  const validateForm = (nickname: string, roomName?: string) => {
    const newErrors = {
      nickname: validateNickname(nickname),
      roomName: roomName ? validateRoomName(roomName) : '',
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== '');
  };

  return { errors, validateForm, updateInput, setErrors };
};
