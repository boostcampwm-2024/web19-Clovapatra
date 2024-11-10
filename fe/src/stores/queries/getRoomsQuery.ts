import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Room } from '@/types/roomTypes';

const BASE_URL = 'https://game.clovapatra.com';

const gameAPI = axios.create({
  baseURL: BASE_URL,
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
