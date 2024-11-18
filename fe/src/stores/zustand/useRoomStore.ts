import { Room } from '@/types/roomTypes';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface RoomStore {
  rooms: Room[];
  currentRoom: Room | null;
  currentPlayer: string | null;
}

interface RoomActions {
  setRooms: (rooms: Room[]) => void;
  setCurrentRoom: (room: Room) => void;
  setCurrentPlayer: (nickname: string) => void;
}

const initialState: RoomStore = {
  rooms: [],
  currentRoom: null,
  currentPlayer: null,
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

    setCurrentPlayer: (nickname) =>
      set(() => ({
        currentPlayer: nickname,
      })),
  }))
);

export default useRoomStore;
