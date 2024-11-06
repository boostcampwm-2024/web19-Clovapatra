import { ApiProperty } from '@nestjs/swagger';

export class JoinRoomDto {
  @ApiProperty({
    example: '6f42377f-42ea-42cc-ac1a-b5d2b99d4ced',
    description: '게임 방 ID',
  })
  roomId: string;

  @ApiProperty({
    example: 'playerNickname123',
    description: '입장할 사용자의 닉네임',
  })
  playerNickname: string;
}
