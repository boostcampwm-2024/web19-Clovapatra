import SearchBar from '@/components/common/SearchBar';
import RoomHeader from './RoomHeader/RoomHeader';
import RoomList from './RoomList/RoomList';
import { useRoomsSSE } from '@/hooks/useRoomsSSE';
import { getRoomsQuery } from '@/stores/queries/getRoomsQuery';
import useRoomStore from '@/stores/zustand/useRoomStore';
import { useEffect } from 'react';
import { ENV } from '@/config/env';
import { Room } from '@/types/roomTypes';

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
