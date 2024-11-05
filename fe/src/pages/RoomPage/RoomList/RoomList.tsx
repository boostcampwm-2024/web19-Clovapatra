import { Room } from '@/types/room';
import { useEffect, useState } from 'react';
import GameRoom from './GameRoom';
import Pagination from './Pagination';
import useRoomStore from '@/store/useRoomStore';

const RoomList = () => {
  const rooms = useRoomStore((state) => state.rooms);
  const [currentPage, setCurrentPage] = useState(0);

  const ROOMS_PER_PAGE = 9;
  const totalPages = Math.ceil(rooms.length / ROOMS_PER_PAGE);

  const currentRooms = rooms.slice(
    currentPage * ROOMS_PER_PAGE,
    (currentPage + 1) * ROOMS_PER_PAGE
  );

  useEffect(() => {
    if (rooms.length > ROOMS_PER_PAGE * (currentPage + 1)) {
      setCurrentPage(currentPage + 1);
    }
  }, [rooms.length, totalPages]);

  return (
    <div className="space-y-6 max-h-screen mt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentRooms.map((room) => (
          <GameRoom key={room.id} room={room} />
        ))}
        {currentRooms.length > 0 &&
          currentRooms.length < ROOMS_PER_PAGE &&
          Array.from({ length: ROOMS_PER_PAGE - currentRooms.length }).map(
            (_, i) => <div key={`empty-${i}`} className="w-full h-0"></div>
          )}
      </div>

      {rooms.length > ROOMS_PER_PAGE && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
      {rooms.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          생성된 방이 없습니다.
        </div>
      )}
    </div>
  );
};

export default RoomList;
