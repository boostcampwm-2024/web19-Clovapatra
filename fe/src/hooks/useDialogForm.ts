import { useRef, useEffect, KeyboardEvent } from 'react';

interface UseDialogFormProps {
  inputs: {
    id: string;
    value: string;
    onChange: (value: string) => void;
  }[];
  onSubmit: () => void;
  isSubmitDisabled: boolean;
}

export const useDialogForm = ({
  inputs,
  onSubmit,
  isSubmitDisabled,
}: UseDialogFormProps) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // 첫 번째 입력 필드에 포커스
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      // 마지막 입력 필드가 아닌 경우 다음 필드로 이동
      if (index < inputs.length - 1) {
        inputRefs.current[index + 1]?.focus();
        return;
      }

      // 마지막 입력 필드이고 제출이 가능한 경우 제출
      if (!isSubmitDisabled) {
        onSubmit();
      }
    }
  };

  return {
    inputRefs,
    handleKeyDown,
  };
};
