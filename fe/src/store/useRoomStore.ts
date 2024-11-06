import { createRoom } from '@/api/socketApi';
import { Room, RoomStore } from '@/types/roomTypes';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useRoomStore = create<RoomStore>()(
  devtools(
    (set) => ({
      rooms: [],
      currentRoom: null,

      addRoom: async (roomName: string, nickname: string): Promise<string> => {
        try {
          const newRoom = await createRoom(roomName, nickname);
          set((state) => ({
            rooms: [...state.rooms, newRoom],
            currentRoom: newRoom,
          }));
          return newRoom.roomId;
        } catch (error) {
          console.error('방 생성 실패:', error);
          throw error;
        }
      },
    }),
    {
      name: 'Room Store',
    }
  )
);

export default useRoomStore;
