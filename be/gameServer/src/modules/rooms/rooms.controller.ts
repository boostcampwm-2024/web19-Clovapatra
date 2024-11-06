import { Controller, Get, Logger } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { RoomDataDto } from './dto/room-data.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Rooms (REST)')
@Controller('rooms')
export class RoomController {
  private readonly logger = new Logger(RoomController.name);

  constructor(private readonly redisService: RedisService) {}

  @Get()
  @ApiOperation({
    summary: '게임 방 목록 조회',
    description: 'Redis에서 저장된 모든 게임 방 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '게임 방 목록이 성공적으로 반환됩니다.',
    type: [RoomDataDto],
  })
  async getRooms(): Promise<RoomDataDto[]> {
    const roomKeys = await this.redisService.keys('room:*');
    this.logger.log('게임 방 목록 조회 시작');

    const rooms = await Promise.all(
      roomKeys.map(async (key) => {
        const roomData = await this.redisService.get<string>(key);
        return JSON.parse(roomData) as RoomDataDto;
      }),
    );
    this.logger.log(`게임 방 목록 조회 완료, ${rooms.length}개 방 반환`);
    return rooms;
  }
}
