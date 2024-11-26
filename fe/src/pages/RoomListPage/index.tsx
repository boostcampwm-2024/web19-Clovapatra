import SearchBar from '@/components/common/SearchBar';
import RoomHeader from './RoomHeader/RoomHeader';
import RoomList from './RoomList/RoomList';
import { useRoomsSSE } from '@/hooks/useRoomsSSE';
import { useEffect, useState } from 'react';
import CustomAlertDialog from '@/components/common/CustomAlertDialog';

const RoomListPage = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [kickedRoomName, setKickedRoomName] = useState('');

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
    <div>
      <RoomHeader />
      <SearchBar />
      <RoomList />
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
