import { createRoom, joinRoom } from '@/services/socket';
import { RoomStore } from '@/types/roomTypes';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useRoomStore = create<RoomStore>()(
  devtools(
    (set) => ({
      rooms: [],
      currentRoom: null,

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
                updatedRooms.find((room) => room.roomId === roomId) || null,
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
