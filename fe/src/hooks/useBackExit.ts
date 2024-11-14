import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const useBackExit = ({ onBack }) => {
  const location = useLocation();
  const isInitialRender = useRef(true);

  useEffect(() => {
    if (isInitialRender.current) {
      // 페이지 첫 렌더링 시에만 state 추가
      window.history.replaceState(
        { shouldConfirm: true },
        '',
        location.pathname
      );
      window.history.pushState({ shouldConfirm: true }, '', location.pathname);
      isInitialRender.current = false;
    }

    const handlePopState = (event: PopStateEvent) => {
      // state가 있고 shouldConfirm이 true인 경우에만 처리
      if (event.state && event.state.shouldConfirm) {
        // 뒤로가기 실행 시 다이얼로그 표시
        onBack();
        // 현재 URL 유지
        window.history.pushState(
          { shouldConfirm: true },
          '',
          location.pathname
        );
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => window.removeEventListener('popstate', handlePopState);
  }, [location.pathname, onBack]);
};
