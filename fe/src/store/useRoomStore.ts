import { Room, RoomStore } from '@/types/room';
import { create } from 'zustand';

const useRoomStore = create<RoomStore>((set) => ({
  rooms: [],
  addRoom: (roomName: string, nickname: string) => {
    const newRoom: Room = {
      id: Math.random().toString(36).substr(2, 9),
      name: roomName,
      creator: nickname,
      players: [nickname],
      isGameStarted: false,
    };

    set((state) => ({
      rooms: [...state.rooms, newRoom],
    }));
  },
}));

export default useRoomStore;
