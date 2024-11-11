import SearchBar from '@/components/common/SearchBar';
import RoomHeader from './RoomHeader/RoomHeader';
import RoomList from './RoomList/RoomList';
import { useEffect } from 'react';
import { useRefreshRooms } from '@/hooks/useRefreshRooms';

const RoomPage = () => {
  const refreshRooms = useRefreshRooms();

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
