import useRoomStore from '@/store/useRoomStore';
import { useState, useEffect } from 'react';

const ROOMS_PER_PAGE = 9;

export const usePagination = () => {
  const rooms = useRoomStore((state) => state.rooms);
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(rooms.length / ROOMS_PER_PAGE);

  const currentRooms = rooms.slice(
    currentPage * ROOMS_PER_PAGE,
    (currentPage + 1) * ROOMS_PER_PAGE
  );

  useEffect(() => {
    if (rooms.length > ROOMS_PER_PAGE * (currentPage + 1)) {
      setCurrentPage(currentPage + 1);
    }
  }, [rooms.length, currentPage]);

  return {
    currentPage,
    setCurrentPage,
    totalPages,
    currentRooms,
    isEmpty: rooms.length === 0,
    showPagination: rooms.length > ROOMS_PER_PAGE,
  };
};
