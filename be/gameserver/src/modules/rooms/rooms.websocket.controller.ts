import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomDataDto } from './dto/room-data.dto';
import { JoinRoomDto } from './dto/join-data.dto';

@ApiTags('Rooms (WebSocket)')
@Controller('ws')
export class RoomsWebSocketController {
  @Post('createRoom')
  @ApiOperation({
    summary: 'Create Room (WebSocket Event)',
    description:
      'ws://clovapatra.com/rooms 에서 "createRoom" 이벤트를 emit해 사용합니다. 성공적으로 게임방이 생성되면 "roomCreated" 이벤트를 수신해 RoomData를 받을 수 있습니다.',
  })
  @ApiBody({ type: CreateRoomDto })
  @ApiResponse({
    status: 201,
    description: 'Room created successfully',
    type: RoomDataDto,
  })
  createRoom(@Body() createRoomDto: CreateRoomDto): RoomDataDto {
    // This method does not execute any logic. It's for Swagger documentation only.
    return {
      roomId: 'example-room-id',
      roomName: createRoomDto.roomName,
      creatorNickname: createRoomDto.creatorNickname,
      players: [createRoomDto.creatorNickname],
      status: 'waiting',
    };
  }

  @Post('joinRoom')
  @ApiOperation({
    summary: 'Join Room (WebSocket Event)',
    description:
      'ws://clovapatra.com/rooms 에서 "joinRoom" 이벤트를 emit해 사용합니다. 성공적으로 입장하면 방의 모든 사용자에게 "updateUsers" 이벤트를 통해 갱신된 사용자 목록을 제공합니다.',
  })
  @ApiBody({ type: JoinRoomDto })
  @ApiResponse({
    status: 200,
    description: 'Room joined successfully',
    isArray: true,
    type: String,
  })
  joinRoom(@Body() joinRoomDto: JoinRoomDto): string[] {
    return ['example-creator-nickname', joinRoomDto.playerNickname];
  }
}
