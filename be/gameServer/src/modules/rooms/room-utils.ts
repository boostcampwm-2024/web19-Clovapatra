import { RoomDataDto } from './dto/room-data.dto';
import { PlayerDataDto } from '../players/dto/player-data.dto';
import { RoomsConstant } from 'src/common/constant';

export const convertRoomDataToHash = (
  roomData: RoomDataDto,
): Record<string, string> => {
  const { roomId, roomName, hostNickname, players, status } = roomData;

  return {
    roomId,
    roomName,
    hostNickname,
    players: JSON.stringify(players),
    status,
  };
};

export const isRoomFull = (roomData: RoomDataDto): boolean => {
  return roomData.players.length >= RoomsConstant.ROOMS_MAX_PLAYERS;
};

export const isNicknameTaken = (
  roomData: RoomDataDto,
  playerNickname: string,
): boolean => {
  return roomData.players.some(
    (player: PlayerDataDto) => player.playerNickname === playerNickname,
  );
};

export const removePlayerFromRoom = (
  roomData: RoomDataDto,
  nickname: string,
): void => {
  roomData.players = roomData.players.filter(
    (player: PlayerDataDto) => player.playerNickname !== nickname,
  );
};

export const changeRoomHost = (roomData: RoomDataDto): void => {
  roomData.hostNickname = roomData.players[0].playerNickname;
};
