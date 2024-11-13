import useRoomStore from '@/stores/zustand/useRoomStore';
import { useEffect } from 'react';
import { Room } from '@/types/roomTypes';
import { ENV } from '@/config/env';
import { getRoomsQuery } from '@/stores/queries/getRoomsQuery';

export const useRoomsSSE = () => {
  const { data: initialRooms } = getRoomsQuery();
  const { setRooms } = useRoomStore();

  useEffect(() => {
    // 초기 데이터 설정
    if (initialRooms) {
      setRooms(initialRooms);
    }

    // SSE 연결
    const eventSource = new EventSource(ENV.SSE_URL);

    // rooms 데이터 수신 처리
    eventSource.onmessage = (event) => {
      try {
        const rooms = JSON.parse(event.data) as Room[];
        setRooms(rooms);
      } catch (error) {
        console.error('Failed to parse rooms data:', error);
      }
    };

    // 연결 시작
    eventSource.onopen = () => {
      console.log('SSE Connection opened');
    };

    // 에러 처리
    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      eventSource.close();
    };

    // 컴포넌트 언마운트 시 연결 정리 (메모리 누수 예방)
    return () => {
      console.log('Closing SSE connection');
      eventSource.close();
    };
  }, [initialRooms, setRooms]);
};
