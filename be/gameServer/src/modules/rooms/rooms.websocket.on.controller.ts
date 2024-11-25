import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { CreateRoomDto } from './dto/create-room.dto';
import { JoinRoomDto } from './dto/join-data.dto';

@ApiTags('Rooms (WebSocket: 서버에서 수신하는 이벤트)')
@Controller('rooms')
export class RoomsWebSocketOnController {
  @Post('createRoom')
  @ApiOperation({
    summary: '게임 방 생성',
    description:
      'wss://clovapatra.com/rooms 에서 "createRoom" 이벤트를 emit해 사용합니다. 성공적으로 게임방이 생성되면 "roomCreated" 이벤트를 발행해 RoomData를 전달합니다.',
  })
  @ApiBody({ type: CreateRoomDto })
  createRoom(@Body() createRoomDto: CreateRoomDto) {
    // This method does not execute any logic. It's for Swagger documentation only.
    return createRoomDto;
  }

  @Post('joinRoom')
  @ApiOperation({
    summary: '게임 방 입장',
    description:
      'wss://clovapatra.com/rooms 에서 "joinRoom" 이벤트를 emit해 사용합니다. 성공적으로 입장하면 입장한 방의 사용자들에게 "updateUsers" 이벤트를 통해 갱신된 사용자 목록을 제공합니다.',
  })
  @ApiBody({ type: JoinRoomDto })
  joinRoom(@Body() joinRoomDto: JoinRoomDto) {
    return joinRoomDto;
  }

  @Post('disconnect')
  @ApiOperation({
    summary: '게임 방 나가기, 소켓 연결 해제',
    description:
      'wss://clovapatra.com/rooms 에서 "disconnect" 이벤트를 emit해 사용합니다.',
  })
  disconnect(): void {}

  @Post('setReady')
  @ApiOperation({
    summary: '플레이어 준비 완료',
    description:
      'wss://clovapatra.com/rooms 에서 "setReady" 이벤트를 emit해 사용합니다. 이미 준비 완료라면 준비대기로 변하고, 준비 대기라면 준비 완료 상태로 바뀝니다. 성공적으로 처리되면 모든 클라이언트에게 "updateUsers" 이벤트를 발행합니다.',
  })
  ready() {
    return;
  }

  @Post('setMute')
  @ApiOperation({
    summary: '플레이어 음소거',
    description:
      'wss://clovapatra.com/rooms 에서 "setMute" 이벤트를 emit해 사용합니다. 음소거 상태를 토글합니다. 성공적으로 처리되면 모든 클라이언트에게 "updateUsers" 이벤트를 발행합니다.',
  })
  mute() {
    return;
  }

  @Post('kickPlayer')
  @ApiOperation({
    summary: '플레이어 강퇴',
    description:
      'wss://clovapatra.com/rooms 에서 "kickPlayer" 이벤트를 emit해 사용합니다. 성공적으로 강퇴되면 해당 방의 클라이언트에게 "kicked", "updateUsers" 이벤트를 발행합니다.',
  })
  @ApiBody({ type: String, description: '강퇴할 사용자 playerNickname' })
  kickPlayer(@Body() playerNickname: string) {
    return playerNickname;
  }
}
