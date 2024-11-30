import { validateNickname, validateRoomName } from '@/utils/validator';
import { useEffect, useState } from 'react';
import { useDebounce } from './useDebounce';

export const useFormValidation = () => {
  const [errors, setErrors] = useState({
    nickname: '',
    roomName: '',
  });

  // 각 필드의 사용자 상호작용 여부를 저장하는 상태
  // touched가 true인 필드만 유효성 검사 실행
  const [touched, setTouched] = useState({
    nickname: false,
    roomName: false,
  });

  // 실제 입력값을 저장하는 상태
  const [inputs, setInputs] = useState({
    nickname: '',
    roomName: '',
  });

  // 입력값을 디바운스 처리할 state
  const debouncedInputs = useDebounce(inputs, 200);

  // 디바운스된 입력값이 변경될 때마다 유효성 검증
  useEffect(() => {
    const newErrors = {
      // 닉네임 필드가 터치되었을 때만 유효성 검사
      nickname: touched.nickname
        ? debouncedInputs.nickname === ''
          ? '닉네임을 입력해주세요.'
          : validateNickname(debouncedInputs.nickname)
        : '',
      // 방 제목 필드가 터치되었을 때만 유효성 검사
      roomName: touched.roomName
        ? debouncedInputs.roomName === ''
          ? '방 제목을 입력해주세요.'
          : validateRoomName(debouncedInputs.roomName)
        : '',
    };
    setErrors(newErrors);
  }, [debouncedInputs, touched]);

  // 입력값 업데이트 함수
  const updateInput = (field: 'nickname' | 'roomName', value: string) => {
    setInputs((prev) => ({
      ...prev,
      [field]: value,
    }));

    // 입력이 발생한 필드를 터치 상태로 변경
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  // 최종 제출 시 유효성 검증
  const validateForm = (nickname: string, roomName?: string) => {
    // 제출 시에는 모든 필드를 터치 상태로 설정
    setTouched({
      nickname: true,
      roomName: true,
    });

    const newErrors = {
      nickname: validateNickname(nickname),
      roomName: roomName ? validateRoomName(roomName) : '',
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== '');
  };

  // 폼 상태 초기화 (다이얼로그 닫을 때 사용)
  const resetForm = () => {
    setTouched({
      nickname: false,
      roomName: false,
    });
    setErrors({
      nickname: '',
      roomName: '',
    });
    setInputs({
      nickname: '',
      roomName: '',
    });
  };

  return { errors, validateForm, updateInput, setErrors, resetForm };
};
