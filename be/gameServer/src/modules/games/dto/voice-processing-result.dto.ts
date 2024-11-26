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
}
