import GameRoom from './GameRoom';
import Pagination from './Pagination';
import { usePagination } from '@/hooks/usePagination';
import { ROOM_RULES } from '@/constants/room';

const RoomList = () => {
  const {
    currentPage,
    setCurrentPage,
    totalPages,
    currentRooms,
    isEmpty,
    showPagination,
  } = usePagination();

  return (
    <div className="space-y-6 max-h-screen mt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentRooms.map((room) => (
          <GameRoom key={room.id} room={room} />
        ))}
        {currentRooms.length > 0 &&
          currentRooms.length < ROOM_RULES.maxPage &&
          Array.from({ length: ROOM_RULES.maxPage - currentRooms.length }).map(
            (_, i) => <div key={`empty-${i}`} className="w-full h-0"></div>
          )}
      </div>

      {showPagination && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
      {isEmpty && (
        <div className="text-center py-8 text-muted-foreground">
          생성된 방이 없습니다.
        </div>
      )}
    </div>
  );
};

export default RoomList;
