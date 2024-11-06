import { Room, RoomStore } from '@/types/room';
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
          id: roomId,
          name: roomName,
          creator: nickname,
          players: [nickname],
          isGameStarted: false,
        };

        set((state) => ({
          rooms: [...state.rooms, newRoom],
          currentRoom: newRoom,
        }));

        return roomId;
      },
      setCurrentRoom: (roomId: string) => {
        const room = get().rooms.find((r) => r.id === roomId);
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
