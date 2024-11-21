import { GameMode, TurnDataDto } from './dto/turn-data.dto';
import { RoomDataDto } from './../rooms/dto/room-data.dto';
import { GameDataDto } from './dto/game-data.dto';

export function createTurnData(
  roomData: RoomDataDto,
  gameData: GameDataDto,
): TurnDataDto {
  const gameModes = [GameMode.PRONUNCIATION, GameMode.CLEOPATRA];
  const gameMode = gameModes[Math.floor(Math.random() * gameModes.length)];

  let timeLimit: number;
  if (gameMode === GameMode.CLEOPATRA) {
    timeLimit = 10;
  } else {
    // 데이터에 따라 바뀜
    timeLimit = 15;
  }

  let lyrics: string | undefined;
  if (gameMode === GameMode.PRONUNCIATION) {
    // 데이터에 따라 바뀜
    lyrics = '테스트테스트테스트테스트테스트테스트테스트테스트테스트테스트';
  }

  return {
    roomId: roomData.roomId,
    playerNickname: gameData.currentPlayer,
    gameMode: gameMode,
    timeLimit: timeLimit,
    lyrics: lyrics,
  };
}

export function selectCurrentPlayer(alivePlayers: string[]): string {
  const randomIndex = Math.floor(Math.random() * alivePlayers.length);
  return alivePlayers[randomIndex];
}

export function checkPlayersReady(roomData: RoomDataDto): boolean {
  return roomData.players
    .filter((player) => player.playerNickname !== roomData.hostNickname)
    .every((player) => player.isReady);
}

export function removePlayerFromGame(
  gameData: GameDataDto,
  playerNickname: string,
): void {
  gameData.alivePlayers = gameData.alivePlayers.filter(
    (player: string) => player !== playerNickname,
  );
}
