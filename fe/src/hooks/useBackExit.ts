import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const useBackExit = ({ setShowExitDialog }) => {
  const location = useLocation();
  const isInitialRender = useRef(true);
  const popStateListenerRef = useRef<(() => void) | null>(null);

  // 컴포넌트 마운트 시 한 번만 실행
  useEffect(() => {
    // 이전에 등록된 리스너가 있다면 제거
    if (popStateListenerRef.current) {
      window.removeEventListener('popstate', popStateListenerRef.current);
    }

    // 새로운 popstate 이벤트 리스너 생성
    const handlePopState = () => {
      setShowExitDialog(true);
      window.history.pushState(null, '', window.location.pathname);
    };

    // 현재 리스너를 ref에 저장 (cleanup을 위해)
    popStateListenerRef.current = handlePopState;

    // 초기 history 상태 설정 및 이벤트 리스너 등록
    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('popstate', handlePopState);

    // cleanup 함수
    return () => {
      if (popStateListenerRef.current) {
        window.removeEventListener('popstate', popStateListenerRef.current);
        popStateListenerRef.current = null;
      }
    };
  }, []); // 빈 의존성 배열로 마운트 시에만 실행
};
