import SearchBar from '@/components/common/SearchBar';
import RoomHeader from './RoomHeader/RoomHeader';
import RoomList from './RoomList/RoomList';
import { gameSocket } from '@/services/gameSocket';
import { useEffect } from 'react';
import { signalingSocket } from '@/services/signalingSocket';
import { useRefreshRooms } from '@/hooks/useRefreshRooms';

const RoomPage = () => {
  const refreshRooms = useRefreshRooms();

  useEffect(() => {
    // 소켓이 연결되어 있지 않을 때만 연결
    if (!gameSocket.isConnected()) {
      gameSocket.connect();
    }
    if (!signalingSocket.isConnected()) {
      signalingSocket.connect();
    }

    refreshRooms();

    const interval = setInterval(() => {
      refreshRooms();
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [refreshRooms]);

  return (
    <div>
      <RoomHeader />
      <SearchBar />
      <RoomList />
    </div>
  );
};

export default RoomPage;
