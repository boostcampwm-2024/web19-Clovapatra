import { Input } from '@/components/ui/input';
import { FiSearch } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import useRoomStore from '@/stores/zustand/useRoomStore';
import { searchRoomsQuery } from '@/stores/queries/searchRoomsQuery';
import { getRoomsQuery } from '@/stores/queries/getRoomsQuery';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 200); // 200ms 디바운스
  const { setRooms } = useRoomStore();
  const { data: searchResults } = searchRoomsQuery(debouncedSearch);
  const { data: allRooms, refetch: refetchAllRooms } = getRoomsQuery();

  // 검색 결과 또는 전체 방 목록으로 업데이트
  useEffect(() => {
    if (!debouncedSearch.trim() && allRooms) {
      refetchAllRooms();
      setRooms(allRooms);
      return;
    }

    // 검색 결과가 있으면 방 목록 업데이트
    if (searchResults) {
      setRooms(searchResults);
    }
  }, [debouncedSearch, searchResults, allRooms, setRooms, refetchAllRooms]);

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
