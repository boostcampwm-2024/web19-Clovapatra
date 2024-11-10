import SearchBar from '@/components/common/SearchBar';
import RoomHeader from './RoomHeader/RoomHeader';
import RoomList from './RoomList/RoomList';
import { useEffect } from 'react';
import { useRoomActions } from '@/hooks/useRoomActions';

const RoomPage = () => {
  const { refreshRooms } = useRoomActions();

  useEffect(() => {
    refreshRooms();

    const interval = setInterval(() => {
      refreshRooms();
    }, 3000);

    return () => clearInterval(interval);
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
