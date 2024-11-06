import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty({ example: '게임방123', description: 'Room name' })
  roomName: string;
  @ApiProperty({
    example: 'hostNickname123',
    description: 'hostNickname',
  })
  hostNickname: string;
}
