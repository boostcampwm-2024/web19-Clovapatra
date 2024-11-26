import { ENV } from '@/config/env';
import { Room } from '@/types/roomTypes';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const gameAPI = axios.create({
  baseURL: ENV.REST_BASE_URL,
  timeout: 5000,
  withCredentials: false,
});

export const searchRoomsQuery = (searchTerm: string) => {
  return useQuery({
    queryKey: ['rooms', 'search', searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      const response = await gameAPI.get<Room[]>(
        `/api/rooms/search?roomName=${encodeURIComponent(searchTerm)}`
      );
      return response.data;
    },
    enabled: !!searchTerm.trim(), // 검색어가 있을 때만 쿼리 실행
  });
};
