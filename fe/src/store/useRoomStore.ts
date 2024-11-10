import { getRooms } from '@/api/api';
import { createRoom, joinRoom } from '@/api/socket';
import { Room } from '@/types/roomTypes';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface RoomStore {
  rooms: Room[];
  currentRoom: Room | null;
  refreshRooms: () => Promise<void>;
  addRoom: (roomName: string, hostNickname: string) => Promise<string>;
  joinGameRoom: (roomId: string, playerNickname: string) => void;
  updateCurrentRoom: (room: Room) => void;
}

const useRoomStore = create<RoomStore>()(
  devtools(
    (set) => ({
      rooms: [],
      currentRoom: null,

      refreshRooms: async () => {
        try {
          const rooms = await getRooms();

          // currentRoom을 유지하면서 rooms 업데이트
          set((state) => ({
            rooms,
            // 현재 방이 있다면 유지
            currentRoom: state.currentRoom,
          }));
        } catch (error) {
          console.error('방 목록 조회 실패:', error);
          throw error;
        }
      },

      updateCurrentRoom: (room: Room) => {
        set((state) => {
          // 현재 rooms 배열에서 해당 방을 찾아 업데이트
          const updatedRooms = state.rooms.map((r) =>
            r.roomId === room.roomId ? room : r
          );

          return {
            rooms: updatedRooms,
            currentRoom: room,
          };
        });
      },

      addRoom: async (
        roomName: string,
        hostNickname: string
      ): Promise<string> => {
        try {
          const newRoom = await createRoom(roomName, hostNickname);

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

      joinGameRoom: async (roomId: string, playerNickname: string) => {
        try {
          const { room } = await joinRoom(roomId, playerNickname);

          set((state) => {
            const updatedRooms = state.rooms.map((existingRoom) =>
              existingRoom.roomId === roomId
                ? { ...existingRoom, players: room.players }
                : existingRoom
            );

            return {
              rooms: updatedRooms,
              currentRoom:
                updatedRooms.find((r) => r.roomId === roomId) || null,
            };
          });
        } catch (error) {
          console.error('방 입장 실패:', error);
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
