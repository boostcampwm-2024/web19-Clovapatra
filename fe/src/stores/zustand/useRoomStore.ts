import { Room } from '@/types/roomTypes';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface RoomStore {
  rooms: Room[];
  currentRoom: Room | null;
}

interface RoomActions {
  setRooms: (rooms: Room[]) => void;
  setCurrentRoom: (room: Room) => void;
}

const initialState: RoomStore = {
  rooms: [],
  currentRoom: null,
};

const useRoomStore = create<RoomStore & RoomActions>()(
  devtools((set) => ({
    ...initialState,

    setRooms: (rooms) =>
      set(() => ({
        rooms,
      })),

    setCurrentRoom: (room) =>
      set(() => ({
        currentRoom: room,
      })),
  }))
);

export default useRoomStore;
