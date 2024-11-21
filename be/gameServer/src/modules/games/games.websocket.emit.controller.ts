import { Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TurnDataDto } from './dto/turn-data.dto';
import { VoiceProcessingResultDto } from './dto/voice-processing-result.dto';

@ApiTags('Rooms (WebSocket: 서버에서 발행하는 이벤트)')
@Controller('rooms')
export class GamesWebSocketEmitController {
  @Post('turnChanged')
  @ApiOperation({
    summary: '현재 단계 수행할 정보',
    description: 'turnData를 전달해 현재 단계 수행에 대한 정보를 전달합니다.',
  })
  @ApiResponse({
    description: '현재 단계 정보',
    type: TurnDataDto,
  })
  turnChanged() {
    return;
  }

  @Post('voiceProcessingResult')
  @ApiOperation({
    summary: '채점 결과',
    description:
      '해당 단계를 수행한 playerNickname과 result(SUCCESS, FAILURE)을 전달합니다.',
  })
  @ApiResponse({
    description: '채점 결과',
    type: VoiceProcessingResultDto,
  })
  voiceProcessingResult() {
    return;
  }
}
