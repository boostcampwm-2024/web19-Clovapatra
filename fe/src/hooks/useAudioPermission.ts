import { MEDIA_CONSTRAINTS } from '@/constants/audio';
import { useState } from 'react';

export const useAudioPermission = () => {
  const [isLoading, setIsLoading] = useState(false);

  const requestPermission = async () => {
    setIsLoading(true);
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
      return stream;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          throw new Error('마이크 권한이 필요합니다.');
        }
        throw new Error('마이크 연결에 실패했습니다.');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { requestPermission, isLoading };
};
