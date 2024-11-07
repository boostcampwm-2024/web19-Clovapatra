import SearchBar from '@/components/common/SearchBar';
import RoomHeader from './RoomHeader/RoomHeader';
import RoomList from './RoomList/RoomList';
import useRoomStore from '@/store/useRoomStore';
import { useEffect } from 'react';

const RoomPage = () => {
  const refreshRooms = useRoomStore((state) => state.refreshRooms);

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
