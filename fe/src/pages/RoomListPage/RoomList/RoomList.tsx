import GameRoom from './GameRoom';
import Pagination from './Pagination';
import { usePagination } from '@/hooks/usePagination';
import { RULES } from '@/constants/rules';
import { useState } from 'react';
import JoinDialog from '../RoomDialog/JoinDialog';

const RoomList = () => {
  const {
    currentPage,
    setCurrentPage,
    totalPages,
    currentRooms,
    isEmpty,
    showPagination,
  } = usePagination();

  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const onJoinRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    setIsJoinDialogOpen(true);
  };

  return (
    <div className="space-y-6 max-h-screen mt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentRooms.map((room) => (
          <GameRoom key={room.roomId} room={room} onJoinRoom={onJoinRoom} />
        ))}
        {currentRooms.length > 0 &&
          currentRooms.length < RULES.maxPage &&
          Array.from({ length: RULES.maxPage - currentRooms.length }).map(
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
        <div className="font-galmuri text-center py-8 text-muted-foreground">
          생성된 방이 없습니다.
        </div>
      )}

      {selectedRoomId && (
        <JoinDialog
          open={isJoinDialogOpen}
          onOpenChange={setIsJoinDialogOpen}
          roomId={selectedRoomId}
        />
      )}
    </div>
  );
};

export default RoomList;
