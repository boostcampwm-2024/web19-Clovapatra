import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Games (WebSocket: 서버에서 발행하는 이벤트)')
@Controller('games')
export class RoomsWebSocketEmitController {}
