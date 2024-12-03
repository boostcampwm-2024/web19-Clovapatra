import { PaginationData, Room } from '@/types/roomTypes';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface RoomStore {
  rooms: Room[];
  currentRoom: Room | null;
  currentPlayer: string | null;
  kickedPlayer: string | null;
  pagination: PaginationData | null;
  userPage: number;
}

interface RoomActions {
  setRooms: (rooms: Room[]) => void;
  setCurrentRoom: (room: Room) => void;
  setCurrentPlayer: (nickname: string) => void;
  setKickedPlayer: (nickname: string) => void;
  setPagination: (pagination: PaginationData) => void;
  setUserPage: (userPage: number) => void;
}

const initialState: RoomStore = {
  rooms: [],
  currentRoom: null,
  currentPlayer: '',
  kickedPlayer: '',
  pagination: null,
  userPage: 0,
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

    setKickedPlayer: (nickname) =>
      set(() => ({
        kickedPlayer: nickname,
      })),

    setPagination: (pagination) =>
      set(() => ({
        pagination,
      })),

    setUserPage: (userPage) => {
      set(() => ({
        userPage,
      }));
    },
  }))
);

export default useRoomStore;
