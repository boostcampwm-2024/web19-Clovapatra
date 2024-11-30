import { ApiProperty } from '@nestjs/swagger';

export class VoiceProcessingResultDto {
  @ApiProperty({
    example: 'player1',
    type: String,
    description: '플레이어 닉네임',
  })
  playerNickname: string;

  @ApiProperty({
    example: 'PASS',
    type: String,
    description: '결과',
  })
  result: string;

  @ApiProperty({
    example: '3옥도#',
    type: String,
    description: '음계',
    required: false,
  })
  note?: string;

  @ApiProperty({
    example: 99,
    type: Number,
    description: '발음 게임 점수',
  })
  procounceScore?: number;
}
