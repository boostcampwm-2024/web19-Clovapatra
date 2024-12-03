import { PlayerDataDto } from '../../players/dto/player-data.dto';

export class GameDataDto {
  gameId: string;
  players: PlayerDataDto[];
  alivePlayers: string[];
  currentTurn: number;
  currentPlayer: string;
  previousPitch: number;
  previousPlayers: string[];
  rank: string[];
}
