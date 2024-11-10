import { Room } from '@/types/roomTypes';
import axios from 'axios';

const BASE_URL = 'https://game.clovapatra.com';

export const gameAPI = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  withCredentials: false,
});

export const getRooms = async (): Promise<Room[]> => {
  const response = await gameAPI.get('/api/rooms');

  return response.data;
};
