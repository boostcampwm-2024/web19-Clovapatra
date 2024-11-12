import { Controller, Logger, Sse, MessageEvent } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { RoomDataDto } from './dto/room-data.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Observable, Subject } from 'rxjs';

@ApiTags('Rooms')
@Controller('rooms')
export class RoomController {
  private readonly logger = new Logger(RoomController.name);
  private readonly roomUpdateSubject = new Subject<MessageEvent>();

  constructor(private readonly redisService: RedisService) {
    this.redisService.subscribeToChannel('roomUpdate', async (message) => {
      this.logger.log(`게임방 업데이트 감지: ${message}`);

      const roomKeys = await this.redisService.keys('room:*');
      const rooms = await Promise.all(
        roomKeys.map(async (key) => {
          const roomData = await this.redisService.get<string>(key);
          return JSON.parse(roomData) as RoomDataDto;
        }),
      );
      this.roomUpdateSubject.next({ data: rooms });
    });
  }

  @Sse()
  @ApiOperation({
    summary: '게임 방 목록 조회하는 SSE',
    description: 'roomData가 변경되었을 시 변경된 room 배열을 전송합니다.',
  })
  @ApiResponse({
    description: '게임 방 목록이 성공적으로 반환됩니다.',
    type: [RoomDataDto],
  })
  getRoomUpdates(): Observable<MessageEvent> {
    return this.roomUpdateSubject.asObservable();
  }
}
