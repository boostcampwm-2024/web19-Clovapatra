import { ApiProperty } from '@nestjs/swagger';

export class RoomDataDto {
  @ApiProperty({ example: '123124', description: 'Room Id' })
  roomId: string;

  @ApiProperty({ example: '게임방123', description: 'Room name' })
  roomName: string;

  @ApiProperty({ example: 'hostUser123', description: 'Host user nickname' })
  hostNickName: string;

  @ApiProperty({
    example: ['hostUser123'],
    description: 'List of users currently in the room',
  })
  users: string[];

  @ApiProperty({
    example: 'waiting',
    description: 'Current status of the room (e.g., waiting, in-game',
  })
  status: string;
}
