import SearchBar from '@/components/common/SearchBar';
import RoomHeader from './RoomHeader/RoomHeader';
import RoomList from './RoomList/RoomList';

const RoomPage = () => {
  return (
    <div>
      <RoomHeader />
      <SearchBar />
      <RoomList />
    </div>
  );
};

export default RoomPage;
