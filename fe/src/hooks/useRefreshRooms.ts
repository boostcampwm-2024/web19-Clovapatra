import { getRoomsQuery } from '@/stores/queries/getRoomsQuery';
import useRoomStore from '@/stores/zustand/useRoomStore';
import { useEffect } from 'react';

export const useRefreshRooms = () => {
  const { data: rooms, refetch } = getRoomsQuery();
  const setRooms = useRoomStore((state) => state.setRooms);

  useEffect(() => {
    if (rooms) {
      setRooms(rooms);
    }
  }, [rooms]);

  return refetch;
};
