import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty({ example: '게임방123', description: 'Room name' })
  roomName: string;
  @ApiProperty({
    example: 'creatorNickname123',
    description: 'creatorNickname',
  })
  creatorNickname: string;
}
