import GameRoom from './GameRoom';
import Pagination from './Pagination';
import { RULES } from '@/constants/rules';
import { useEffect, useState } from 'react';
import JoinDialog from '../RoomDialog/JoinDialog';
import useRoomStore from '@/stores/zustand/useRoomStore';

const RoomList = () => {
  const rooms = useRoomStore((state) => state.rooms);
  const pagination = useRoomStore((state) => state.pagination);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [showPagination, setShowPagination] = useState(false);
  const isEmpty = rooms.length === 0;

  useEffect(() => {
    if (pagination?.totalPages > 1) {
      setShowPagination(true);
    }

    if (pagination?.totalPages === 1) {
      setShowPagination(false);
    }
  }, [pagination]);

  const onJoinRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    setIsJoinDialogOpen(true);
  };

  return (
    <div className="space-y-6 max-h-screen mt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <GameRoom key={room.roomId} room={room} onJoinRoom={onJoinRoom} />
        ))}
        {rooms.length > 0 &&
          rooms.length < RULES.maxPage &&
          Array.from({ length: RULES.maxPage - rooms.length }).map((_, i) => (
            <div key={`empty-${i}`} className="w-full h-0"></div>
          ))}
      </div>

      {showPagination && <Pagination />}

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
