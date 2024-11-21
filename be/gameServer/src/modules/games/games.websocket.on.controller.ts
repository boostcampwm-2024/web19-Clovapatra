import { Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { VoiceResultFromServerDto } from './dto/Voice-result-from-server.dto';

@ApiTags('Rooms (WebSocket: 서버에서 수신하는 이벤트)')
@Controller('rooms')
export class GamesWebSocketOnController {
  @Post('startGame')
  @ApiOperation({
    summary: '게임시작',
    description:
      'wss://clovapatra.com/rooms 에서 "startGame" 이벤트를 emit해 사용합니다. 성공적으로 게임이 시작되면 "turnChanged" 이벤트를 발행해 게임 진행에 필요한 정보를 전달합니다.',
  })
  startGame() {
    // This method does not execute any logic. It's for Swagger documentation only.
    return;
  }

  @Post('voiceResult')
  @ApiOperation({
    summary: '음성 처리서버에서 처리한 결과 받기',
    description:
      'wss://clovapatra.com/rooms 에서 "voiceResult" 이벤트를 emit해 사용합니다.',
  })
  @ApiBody({ type: VoiceResultFromServerDto })
  voiceResult() {
    // This method does not execute any logic. It's for Swagger documentation only.
    return;
  }
}
