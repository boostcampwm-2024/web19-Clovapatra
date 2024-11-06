import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty({ example: '게임방123', description: 'Room name' })
  roomName: string;

  @ApiProperty({ example: 'hostUser123', description: 'Host user nickname' })
  hostNickName: string;
}
