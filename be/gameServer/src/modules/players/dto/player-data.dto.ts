import { ApiProperty } from '@nestjs/swagger';

export class PlayerDataDto {
  @ApiProperty({
    example: 'playerNickname123',
    description: '플레이어의 닉네임',
  })
  playerNickname: string;

  @ApiProperty({
    example: true,
    description: '플레이어의 준비 상태 (true: 준비 완료, false: 대기 중)',
  })
  isReady: boolean;
}
