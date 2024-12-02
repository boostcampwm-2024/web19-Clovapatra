import { useEffect } from 'react';
import { toast } from 'react-toastify';

export const usePreventRefresh = (isPlaying: boolean) => {
  useEffect(() => {
    if (!isPlaying) return;

    const preventKeyboardRefresh = (e: KeyboardEvent) => {
      if (
        e.key === 'F5' ||
        (e.ctrlKey && e.key === 'r') ||
        (e.metaKey && e.key === 'r')
      ) {
        e.preventDefault();

        toast.error('게임 중에는 새로고침 할 수 없습니다!', {
          position: 'top-left',
          autoClose: 1000,
          style: {
            fontFamily: 'Galmuri11, monospace',
            width: '25rem',
            minWidth: '25rem',
          },
        });
      }
    };

    document.addEventListener('keydown', preventKeyboardRefresh);

    return () => {
      document.removeEventListener('keydown', preventKeyboardRefresh);
    };
  }, [isPlaying]);
};
