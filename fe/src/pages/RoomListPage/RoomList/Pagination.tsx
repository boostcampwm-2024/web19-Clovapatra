import { Button } from '@/components/ui/button';
import { getRoomsQuery } from '@/stores/queries/getRoomsQuery';
import useRoomStore from '@/stores/zustand/useRoomStore';
import { useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';

const Pagination = () => {
  const { pagination, setUserPage } = useRoomStore();
  const userPage = useRoomStore((state) => state.userPage);
  const { totalPages } = pagination;
  const { refetch } = getRoomsQuery(userPage);

  useEffect(() => {
    refetch();
  }, [userPage, refetch]);

  const handlePageChange = async (newPage: number) => {
    setUserPage(newPage);
  };

  return (
    <div className="flex items-center justify-center gap-4 mt-6">
      <Button
        variant="outline"
        size="icon"
        disabled={!userPage}
        onClick={() => handlePageChange(userPage - 1)}
      >
        <FaChevronLeft className="w-4 h-4" />
      </Button>
      <div className="flex items-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <Button
            key={i}
            variant={userPage === i ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePageChange(i)}
            className="w-8 h-8"
          >
            {i + 1}
          </Button>
        ))}
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(userPage + 1)}
        disabled={userPage === totalPages - 1}
      >
        <FaChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default Pagination;
