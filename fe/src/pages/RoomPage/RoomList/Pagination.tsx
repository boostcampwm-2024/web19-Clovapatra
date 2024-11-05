import { Button } from '@/components/ui/button';
import { PaginationProps } from '@/types/room';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  return (
    <div className="flex items-center justify-center gap-4 mt-6">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
      >
        <FaChevronLeft className="w-4 h-4" />
      </Button>
      <div className="flex items-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <Button
            key={i}
            variant={currentPage === i ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPageChange(i)}
            className="w-8 h-8"
          >
            {i + 1}
          </Button>
        ))}
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
      >
        <FaChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default Pagination;
