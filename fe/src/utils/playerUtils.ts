import useRoomStore from '@/stores/zustand/useRoomStore';

export const isHost = (playerNickname: string) => {
  const { currentRoom } = useRoomStore();

  return playerNickname === currentRoom.hostNickname;
};
