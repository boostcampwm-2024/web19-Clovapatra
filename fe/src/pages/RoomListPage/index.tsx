import SearchBar from '@/components/common/SearchBar';
import RoomHeader from './RoomHeader/RoomHeader';
import RoomList from './RoomList/RoomList';
import { useEffect, useState } from 'react';
import CustomAlertDialog from '@/components/common/CustomAlertDialog';
import useRoomStore from '@/stores/zustand/useRoomStore';
import { useRoomsSSE } from '@/hooks/useRoomsSSE';

const RoomListPage = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [kickedRoomName, setKickedRoomName] = useState('');
  const { rooms } = useRoomStore();
  const isEmpty = rooms.length === 0;

  useRoomsSSE();

  useEffect(() => {
    const kickedRoomName = sessionStorage.getItem('kickedRoomName');

    if (kickedRoomName) {
      setKickedRoomName(kickedRoomName);
      setShowAlert(true);
      sessionStorage.removeItem('kickedRoomName');
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col pb-16 relative">
      <div className="flex-1">
        <RoomHeader />
        <SearchBar />
        {isEmpty ? (
          <div className="h-[calc(100vh-220px)] flex items-center justify-center font-galmuri text-muted-foreground text-xl">
            생성된 방이 없습니다.
          </div>
        ) : (
          <RoomList />
        )}
      </div>

      <CustomAlertDialog
        open={showAlert}
        onOpenChange={setShowAlert}
        title="알림"
        description={`${kickedRoomName}방에서 강퇴되었습니다.`}
      />
    </div>
  );
};

export default RoomListPage;
