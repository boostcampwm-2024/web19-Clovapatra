import useRoomStore from '@/stores/zustand/useRoomStore';
import { useEffect } from 'react';
import { ENV } from '@/config/env';
import { getRoomsQuery } from '@/stores/queries/getRoomsQuery';

let eventSource: EventSource | null = null;

export const useRoomsSSE = () => {
  const { setRooms, setPagination, setUserPage } = useRoomStore();
  const userPage = useRoomStore((state) => state.userPage);
  const { data } = getRoomsQuery(userPage);

  const connectSSE = (userPage: number) => {
    eventSource = new EventSource(`${ENV.SSE_URL}?page=${userPage}`);

    eventSource.onmessage = (event) => {
      try {
        const sseData = JSON.parse(event.data);
        setRooms(sseData.rooms);
        setPagination(sseData.pagination);

        if (!sseData.rooms.length && userPage > 0) {
          setUserPage(sseData.pagination.currentPage - 1);
          return;
        }

        setUserPage(sseData.pagination.currentPage);
      } catch (error) {
        console.error('Failed to parse rooms data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      eventSource.close();
    };
  };

  useEffect(() => {
    if (data) {
      setRooms(data.rooms);
      setPagination(data.pagination);
      connectSSE(userPage);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
    };
  }, [data?.pagination, data?.rooms, userPage]);
};
