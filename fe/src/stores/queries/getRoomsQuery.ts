import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { PaginatedResponse, Room } from '@/types/roomTypes';
import { ENV } from '@/config/env';

const gameAPI = axios.create({
  baseURL: ENV.REST_BASE_URL,
  timeout: 5000,
  withCredentials: false,
});

export const getRoomsQuery = (currentPage: number) => {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const { data } = await gameAPI.get<PaginatedResponse<Room>>(
        `/api/rooms?page=${currentPage}`
      );

      return data;
    },
  });
};
