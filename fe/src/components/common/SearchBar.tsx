import { Input } from '@/components/ui/input';
import { FiSearch } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import useRoomStore from '@/stores/zustand/useRoomStore';
import { searchRoomsQuery } from '@/stores/queries/searchRoomsQuery';
import { useQueryClient } from '@tanstack/react-query';
import { Room } from '@/types/roomTypes';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 200); // 200ms 디바운스
  const { setRooms } = useRoomStore();
  const { data: searchResults } = searchRoomsQuery(debouncedSearch);
  const queryClient = useQueryClient();

  // 검색 결과 또는 전체 방 목록으로 업데이트
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      // 검색어가 비어있을 때는 캐시된 전체 방 목록 사용
      const cachedRooms = queryClient.getQueryData<Room[]>(['rooms']);
      if (cachedRooms) {
        setRooms(cachedRooms);
      }
      return;
    }

    // 검색 결과가 있으면 방 목록 업데이트
    if (searchResults) {
      setRooms(searchResults);
    }
  }, [debouncedSearch, searchResults, setRooms, queryClient]);

  return (
    <div className="relative w-full mt-6">
      <FiSearch className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="방 제목 검색"
        className="font-galmuri pl-8"
      />
    </div>
  );
};

export default SearchBar;
