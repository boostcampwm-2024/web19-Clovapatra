import { Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RoomDataDto } from './dto/room-data.dto';
import { ErrorResponse } from './dto/error-response.dto';

@ApiTags('Rooms (WebSocket: 서버에서 발행하는 이벤트)')
@Controller('rooms')
export class RoomsWebSocketEmitController {
  @Post('roomCreated')
  @ApiOperation({
    summary: '게임 방 생성 완료',
    description: '성공적으로 게임방이 생성되었을 때 RoomData를 전달합니다.',
  })
  @ApiResponse({
    description: 'Room created successfully',
    type: RoomDataDto,
  })
  createRoom(): RoomDataDto {
    // This method does not execute any logic. It's for Swagger documentation only.
    return {
      roomId: 'example-room-id',
      roomName: 'example-room-name',
      hostNickname: 'example-room-name',
      players: ['example-room-name'],
      status: 'waiting',
    };
  }

  @Post('updateUsers')
  @ApiOperation({
    summary: '게임 방 생성 완료',
    description: '성공적으로 게임방이 생성되었을 때 RoomData를 전달합니다.',
  })
  @ApiResponse({
    description: 'Room created successfully',
    type: RoomDataDto,
  })
  updateUsers(): RoomDataDto {
    // This method does not execute any logic. It's for Swagger documentation only.
    return {
      roomId: 'example-room-id',
      roomName: 'example-room-name',
      hostNickname: 'example-room-name',
      players: ['example-room-name'],
      status: 'waiting',
    };
  }

  @Post('error')
  @ApiOperation({
    summary: '요청 실패 시 에러를 전송합니다.',
  })
  @ApiResponse({
    description: '요청 실패 예시',
    type: ErrorResponse,
  })
  error(): void {}
}
