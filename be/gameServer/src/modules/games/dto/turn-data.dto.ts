import { ApiProperty } from '@nestjs/swagger';

export enum GameMode {
  PRONUNCIATION = 'PRONUNCIATION',
  CLEOPATRA = 'CLEOPATRA',
}

export class TurnDataDto {
  @ApiProperty({
    example: '6f42377f-42ea-42cc-ac1a-b5d2b99d4ced',
    type: String,
    description: '게임 방 ID',
  })
  roomId: string;

  @ApiProperty({
    example: 'player1',
    type: String,
    description: '해당 단계를 수행하는 플레이어 닉네임',
  })
  playerNickname: string;

  @ApiProperty({
    example: GameMode.PRONUNCIATION,
    type: String,
    description: '해당 단계 게임 모드',
  })
  gameMode: GameMode;

  @ApiProperty({
    example: 7,
    type: Number,
    description: '해당 단계 게임 모드를 수행할 때의 제한시간 (sec)',
  })
  timeLimit: number;

  @ApiProperty({
    example:
      '도토리가 문을 도로록, 드르륵, 두루룩 열었는가? 드로록, 두루륵, 두르룩 열었는가.',
    type: String,
    description: '가사',
  })
  lyrics: string;
}
