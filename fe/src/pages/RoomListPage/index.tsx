import SearchBar from '@/components/common/SearchBar';
import RoomHeader from './RoomHeader/RoomHeader';
import RoomList from './RoomList/RoomList';
import { useEffect, useState } from 'react';
import CustomAlertDialog from '@/components/common/CustomAlertDialog';
import useRoomStore from '@/stores/zustand/useRoomStore';
import { useRoomsSSE } from '@/hooks/useRoomsSSE';

const RoomListPage = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const { rooms } = useRoomStore();
  const isEmpty = rooms.length === 0;

  useRoomsSSE();

  useEffect(() => {
    const kickedRoomName = sessionStorage.getItem('kickedRoomName');

    // 강퇴 처리
    if (kickedRoomName) {
      setAlertMessage(`${kickedRoomName}방에서 강퇴되었습니다.`);
      setShowAlert(true);
      sessionStorage.removeItem('kickedRoomName');
    }

    // 게임 중 입장 에러
    const gameInProgressError = sessionStorage.getItem('gameInProgressError');

    if (gameInProgressError) {
      setAlertMessage('게임이 진행 중인 방에는 입장할 수 없습니다.');
      setShowAlert(true);
      sessionStorage.removeItem('gameInProgressError');
    }
  }, []);

  return (
    <div className="game-wrapper">
      <div className="relative overflow-y-auto p-6 mt-2 min-h-screen flex-1">
        <RoomHeader />
        <SearchBar />
        {isEmpty ? (
          <div className="h-[calc(100vh-220px)] flex items-center justify-center font-galmuri text-muted-foreground text-xl">
            <img
              src="https://i.imgur.com/sXJUeME.png"
              alt="생성된 방이 없습니다. 게임방을 만들어 주세요."
              className="w-[28rem] h-[9rem]"
            />
          </div>
        ) : (
          <RoomList />
        )}
      </div>

      <CustomAlertDialog
        open={showAlert}
        onOpenChange={setShowAlert}
        title="알림"
        description={alertMessage}
      />
    </div>
  );
};

export default RoomListPage;
