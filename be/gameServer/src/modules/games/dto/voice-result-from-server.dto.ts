import { ApiProperty } from '@nestjs/swagger';

export class VoiceResultFromServerDto {
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
    example: 92,
    type: Number,
    description: '발음게임 점수',
    required: false,
  })
  pronounceScore?: number;

  @ApiProperty({
    example: 'A#3',
    type: String,
    description: '음정게임 평균 음',
    required: false,
  })
  averageNote?: string;
}
