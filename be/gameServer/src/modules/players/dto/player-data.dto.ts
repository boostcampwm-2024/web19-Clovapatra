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

  @ApiProperty({
    example: true,
    description: '플레이어의 음소거 상태 (true: 음소거, false: 정상)',
  })
  isMuted: boolean;

  @ApiProperty({
    example: true,
    description: '플레이어의 게임 진행 상태 (true: 탈락, false: 생존)',
  })
  isDead: boolean;

  @ApiProperty({
    example: true,
    description: '플레이어의 탈주 상태 (true: 탈주)',
  })
  isLeft: boolean;
}
