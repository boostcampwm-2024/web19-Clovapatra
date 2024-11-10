import { useQuery } from '@tanstack/react-query';
import { getRooms } from '@/services/api';

export const getRoomsQuery = () => {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: getRooms,
  });
};
