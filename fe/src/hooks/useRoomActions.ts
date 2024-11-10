import { getRooms } from '@/services/api';
import {
  createRoom as createRoomApi,
  joinRoom as joinRoomApi,
} from '@/services/socket';
import useRoomStore from '@/stores/zustand/useRoomStore';

export const useRoomActions = () => {
  const setRooms = useRoomStore((state) => state.setRooms);
  const setCurrentRoom = useRoomStore((state) => state.setCurrentRoom);
  const rooms = useRoomStore((state) => state.rooms);

  const refreshRooms = async () => {
    try {
      const rooms = await getRooms();
      setRooms(rooms);
    } catch (error) {
      console.error('방 목록 조회 실패:', error);
      throw error;
    }
  };

  const addRoom = async (
    roomName: string,
    hostNickname: string
  ): Promise<string> => {
    try {
      const newRoom = await createRoomApi(roomName, hostNickname);
      setRooms([...rooms, newRoom]);
      setCurrentRoom(newRoom);
      return newRoom.roomId;
    } catch (error) {
      console.error('방 생성 실패:', error);
      throw error;
    }
  };

  const joinGameRoom = async (roomId: string, playerNickname: string) => {
    try {
      const { room } = await joinRoomApi(roomId, playerNickname);
      setCurrentRoom(room);
    } catch (error) {
      console.error('방 입장 실패:', error);
      throw error;
    }
  };

  return {
    refreshRooms,
    addRoom,
    joinGameRoom,
  };
};
