import { ApiProperty } from '@nestjs/swagger';

export class RoomDataDto {
  @ApiProperty({ example: '123124', description: 'Room Id' })
  roomId: string;

  @ApiProperty({ example: '게임방123', description: 'Room name' })
  roomName: string;

  @ApiProperty({
    example: 'creatorNickname123',
    description: 'creatorNickname',
  })
  creatorNickname: string;

  @ApiProperty({
    example: ['creatorNickname123'],
    description: 'List of players currently in the room',
  })
  players: string[];

  @ApiProperty({
    example: 'waiting',
    description: 'Current status of the room (e.g., waiting, in-game',
  })
  status: string;
}
