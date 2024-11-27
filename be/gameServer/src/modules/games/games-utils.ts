import { GameMode, TurnDataDto } from './dto/turn-data.dto';
import { RoomDataDto } from './../rooms/dto/room-data.dto';
import { GameDataDto } from './dto/game-data.dto';

const SAMPLE_DATA = [
  {
    timeLimit: 7,
    lyrics: '간장공장 공장장은 강 공장장이고 된장공장 공장장은 공 공장장이다.',
  },
  {
    timeLimit: 7,
    lyrics:
      '내가 그린 기린 그림은 긴 기린 그림이고 네가 그린 기린 그림은 안 긴 기린 그림이다.',
  },
  {
    timeLimit: 9,
    lyrics:
      '저기 계신 콩국수 국수 장수는 새 콩국수 국수 장수이고, 여기 계신 콩국수 국수 장수는 헌 콩국수 국수 장수다.',
  },
  {
    timeLimit: 5,
    lyrics: '서울특별시 특허허가과 허가과장 허과장.',
  },
  {
    timeLimit: 6,
    lyrics: '중앙청 창살은 쌍창살이고 시청의 창살은 외창살이다.',
  },
  {
    timeLimit: 4,
    lyrics: '페페페페페페페페페페',
  },
];

export function createTurnData(
  roomId: string,
  gameData: GameDataDto,
): TurnDataDto {
  const gameModes = [
    GameMode.PRONUNCIATION,
    GameMode.CLEOPATRA,
    // GameMode.CLEOPATRA,
    // GameMode.CLEOPATRA,
  ];
  const gameMode = gameModes[Math.floor(Math.random() * gameModes.length)];

  if (gameMode === GameMode.CLEOPATRA) {
    return {
      roomId: roomId,
      playerNickname: gameData.currentPlayer,
      gameMode,
      timeLimit: 7,
      lyrics: '안녕! 클레오파트라! 세상에서 제일가는 포테이토 칩!',
    };
  }
  const randomSentence =
    SAMPLE_DATA[Math.floor(Math.random() * SAMPLE_DATA.length)];

  return {
    roomId: roomId,
    playerNickname: gameData.currentPlayer,
    gameMode,
    timeLimit: randomSentence.timeLimit,
    lyrics: randomSentence.lyrics,
  };
}

export function selectCurrentPlayer(
  alivePlayers: string[],
  previousPlayers: string[],
): string {
  let candidates = alivePlayers;

  if (candidates.length === 0) {
    return null;
  }

  if (
    previousPlayers.length >= 2 &&
    previousPlayers[0] === previousPlayers[1]
  ) {
    candidates = alivePlayers.filter((player) => player !== previousPlayers[0]);
  }
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
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

  gameData.rank.unshift(playerNickname);
}

export function noteToNumber(note: string): number {
  const matches = note.match(/([A-G]#?)(\d+)/);
  if (!matches) return null;

  const [, noteName, octave] = matches;
  const noteBase = {
    C: 0,
    'C#': 1,
    D: 2,
    'D#': 3,
    E: 4,
    F: 5,
    'F#': 6,
    G: 7,
    'G#': 8,
    A: 9,
    'A#': 10,
    B: 11,
  }[noteName];

  return noteBase + (parseInt(octave) + 1) * 12;
}

export function numberToNote(number: number): string {
  const notes = [
    'C',
    'C#',
    'D',
    'D#',
    'E',
    'F',
    'F#',
    'G',
    'G#',
    'A',
    'A#',
    'B',
  ];
  const octave = Math.floor(number / 12) - 1;
  const noteIndex = Math.round(number) % 12;
  return `${notes[noteIndex]}${octave}`;
}

export function updatePreviousPlayers(
  gameData: GameDataDto,
  playerNickname: string,
): void {
  if (gameData.previousPlayers.length >= 2) {
    gameData.previousPlayers.shift();
  }
  gameData.previousPlayers.push(playerNickname);
}

const PRONOUNCE_SCORE_ORIGINAL_THRESOLHD = 50;
const PRONOUNCE_SCORE_THRESOLHD = 90;
const INCREMENT = 2 / 7;
const DECREMENT = 3;

export function transformScore(originalScore) {
  let transformed;
  if (originalScore >= PRONOUNCE_SCORE_ORIGINAL_THRESOLHD) {
    transformed =
      PRONOUNCE_SCORE_THRESOLHD +
      (originalScore - PRONOUNCE_SCORE_ORIGINAL_THRESOLHD) * INCREMENT;
  } else {
    transformed =
      PRONOUNCE_SCORE_THRESOLHD -
      (PRONOUNCE_SCORE_ORIGINAL_THRESOLHD - originalScore) * DECREMENT;
  }

  return Math.max(Math.min(Math.round(transformed), 100), 0);
}
