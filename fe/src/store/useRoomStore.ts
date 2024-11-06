import { Room, RoomStore } from '@/types/roomTypes';
import { v4 } from 'uuid';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useRoomStore = create<RoomStore>()(
  devtools(
    (set, get) => ({
      rooms: [],
      currentRoom: null,
      addRoom: (roomName: string, nickname: string) => {
        const roomId = v4();
        const newRoom: Room = {
          roomId: roomId,
          roomName: roomName,
          hostNickname: nickname,
          players: [nickname],
          status: 'waiting',
        };

        set((state) => ({
          rooms: [...state.rooms, newRoom],
          currentRoom: newRoom,
        }));

        return roomId;
      },
      setCurrentRoom: (roomId: string) => {
        const room = get().rooms.find((r) => r.roomId === roomId);
        set((state) => ({
          ...state,
          currentRoom: room || null,
        }));
      },
    }),
    {
      name: 'Room Store',
    }
  )
);

export default useRoomStore;
