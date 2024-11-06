import { ApiProperty } from '@nestjs/swagger';

export class RoomDataDto {
  @ApiProperty({
    example: '6f42377f-42ea-42cc-ac1a-b5d2b99d4ced',
    description: '게임 방 ID',
  })
  roomId: string;

  @ApiProperty({
    example: '게임방123',
    description: '게임 방 이름',
  })
  roomName: string;

  @ApiProperty({
    example: 'creatorNickname123',
    description: '방을 생성한 사용자의 닉네임',
  })
  creatorNickname: string;

  @ApiProperty({
    example: ['creatorNickname123'],
    description: '현재 방에 참여한 플레이어 목록',
  })
  players: string[];

  @ApiProperty({
    example: 'waiting',
    description: '현재 방의 상태 (예: 대기 중, 게임 중)',
  })
  status: string;
}
