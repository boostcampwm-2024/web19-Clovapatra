import { RoomDataDto } from './dto/room-data.dto';

export const MAX_PLAYERS = 4;

export const isRoomFull = (roomData: RoomDataDto): boolean => {
  return roomData.players.length >= MAX_PLAYERS;
};

export const isNicknameTaken = (
  roomData: RoomDataDto,
  playerNickname: string,
): boolean => {
  return roomData.players.includes(playerNickname);
};

export const removePlayerFromRoom = (
  roomData: RoomDataDto,
  nickname: string,
): void => {
  roomData.players = roomData.players.filter((player) => player !== nickname);
};

export const changeRoomHost = (roomData: RoomDataDto): void => {
  roomData.hostNickname = roomData.players[0];
};
