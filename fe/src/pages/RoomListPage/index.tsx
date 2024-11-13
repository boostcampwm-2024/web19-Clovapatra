import SearchBar from '@/components/common/SearchBar';
import RoomHeader from './RoomHeader/RoomHeader';
import RoomList from './RoomList/RoomList';
import { useRoomsSSE } from '@/hooks/useRoomsSSE';

const RoomListPage = () => {
  useRoomsSSE();

  return (
    <div>
      <RoomHeader />
      <SearchBar />
      <RoomList />
    </div>
  );
};

export default RoomListPage;
