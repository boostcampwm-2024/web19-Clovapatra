export class GameDataDto {
  gameId: string;
  alivePlayers: string[];
  currentTurn: number;
  currentPlayer: string;
  previousPitch: number;
  previousPlayers: string[];
  rank: string[];
}
