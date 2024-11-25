import {
  Controller,
  Get,
  Logger,
  Sse,
  MessageEvent,
  Param,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { RoomDataDto } from './dto/room-data.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Observable, Subject } from 'rxjs';

const ROOM_LIMIT = 9;

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

  @Sse('stream')
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

  @Get('/search')
  @ApiOperation({
    summary: '게임 방 이름으로 검색',
    description:
      '게임 방 이름으로 검색하여 관련된 방을 반환합니다. ex)/api/rooms/search?roomName=w ',
  })
  @ApiResponse({
    status: 200,
    description: '검색된 게임 방 목록이 성공적으로 반환됩니다.',
    type: [RoomDataDto],
  })
  async searchRooms(
    @Query('roomName') roomName: string,
  ): Promise<RoomDataDto[]> {
    this.logger.log(`방 이름으로 검색 시작: ${roomName}`);

    const roomNames: string[] = await this.redisService.zrangebylex(
      'roomNames',
      `[${roomName}`,
      `[${roomName}\udbff\udfff`,
    );

    if (roomNames.length === 0) {
      this.logger.warn(`검색된 방이 없습니다: ${roomName}`);
      return [];
    }

    const roomIds = (
      await Promise.all(
        roomNames.map(async (roomName) => {
          return this.redisService.lrange(`roomName:${roomName}`, 0, -1);
        }),
      )
    ).flat();

    const limitedRoomIds = roomIds.slice(0, ROOM_LIMIT);

    this.logger.log(`roomData ${limitedRoomIds.length}개 반환`);
    return await Promise.all(
      limitedRoomIds.map(async (roomId) => {
        const roomData = await this.redisService.get<string>(`room:${roomId}`);
        return JSON.parse(roomData) as RoomDataDto;
      }),
    );
  }

  @Get(':roomId')
  @ApiOperation({
    summary: '특정 roomId를 가진 게임 방 조회',
    description: '주어진 roomId에 해당하는 게임 방의 데이터를 반환합니다.',
  })
  @ApiParam({
    name: 'roomId',
    required: true,
    description: '조회할 게임 방의 ID',
    example: '1234',
  })
  @ApiResponse({
    description: '특정 roomId에 해당하는 게임 방이 성공적으로 반환됩니다.',
    type: RoomDataDto,
  })
  @ApiResponse({
    status: 404,
    description: 'roomId에 해당하는 게임 방을 찾지 못했습니다.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Room with ID 1234 not found',
        error: 'Not Found',
      },
    },
  })
  async getRoomById(@Param('roomId') roomId: string): Promise<RoomDataDto> {
    this.logger.log(`요청 시작 - Room 조회: roomId=${roomId}`);
    const roomData = await this.redisService.get<string>(`room:${roomId}`);

    if (!roomData) {
      this.logger.warn(`Room 조회 실패 - ID: ${roomId} (존재하지 않는 ID)`);
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }

    this.logger.log(`요청 완료 - Room 조회 성공: roomId=${roomId}`);
    return JSON.parse(roomData) as RoomDataDto;
  }

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
  async getRooms(@Query('page') page: number = 1): Promise<RoomDataDto[]> {
    const roomKeys = await this.redisService.keys('room:*');
    this.logger.log('게임 방 목록 조회 시작');

    const start = (page - 1) * ROOM_LIMIT;
    const end = start + ROOM_LIMIT - 1;
    const paginatedKeys = roomKeys.slice(start, end + 1);

    const rooms = await Promise.all(
      paginatedKeys.map(async (key) => {
        const roomData = await this.redisService.get<string>(key);
        return JSON.parse(roomData) as RoomDataDto;
      }),
    );
    this.logger.log(`게임 방 목록 조회 완료, ${rooms.length}개 방 반환`);
    return rooms;
  }
}
