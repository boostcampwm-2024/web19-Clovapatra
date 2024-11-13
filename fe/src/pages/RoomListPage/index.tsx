import SearchBar from '@/components/common/SearchBar';
import RoomHeader from './RoomHeader/RoomHeader';
import RoomList from './RoomList/RoomList';
import { useEffect } from 'react';
import { useRefreshRooms } from '@/hooks/useRefreshRooms';

const RoomListPage = () => {
  const refetchRooms = useRefreshRooms();

  useEffect(() => {
    refetchRooms();

    const interval = setInterval(() => {
      refetchRooms();
    }, 3000); // 3초에 한 번씩

    return () => {
      clearInterval(interval);
    };
  }, [refetchRooms]);

  return (
    <div>
      <RoomHeader />
      <SearchBar />
      <RoomList />
    </div>
  );
};

export default RoomListPage;
