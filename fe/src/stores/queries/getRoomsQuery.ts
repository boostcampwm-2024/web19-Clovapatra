import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Room } from '@/types/roomTypes';
import { ENV } from '@/config/env';

const gameAPI = axios.create({
  baseURL: ENV.REST_BASE_URL,
  timeout: 5000,
  withCredentials: false,
});

export const getRoomsQuery = () => {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const response = await gameAPI.get<Room[]>('/api/rooms');
      return response.data;
    },
  });
};
