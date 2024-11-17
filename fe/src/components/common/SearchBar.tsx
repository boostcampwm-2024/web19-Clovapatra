import { Input } from '@/components/ui/input';
import { FiSearch } from 'react-icons/fi';

const SearchBar = () => {
  return (
    <form className="relative w-full mt-6">
      <FiSearch className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="검색어를 입력하세요..."
        className="font-galmuri pl-8"
      />
    </form>
  );
};

export default SearchBar;
