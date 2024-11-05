import { Room, RoomStore } from '@/types/room';
import { v4 } from 'uuid';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useRoomStore = create<RoomStore>()(
  devtools(
    (set) => ({
      rooms: [],
      addRoom: (roomName: string, nickname: string) => {
        const newRoom: Room = {
          id: v4(),
          name: roomName,
          creator: nickname,
          players: [nickname],
          isGameStarted: false,
        };

        set((state) => ({
          rooms: [...state.rooms, newRoom],
        }));
      },
    }),
    {
      name: 'Room Store',
    }
  )
);

export default useRoomStore;
