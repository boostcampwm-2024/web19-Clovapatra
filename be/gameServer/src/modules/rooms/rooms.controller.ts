import {
  Controller,
  Get,
  Logger,
  Sse,
  MessageEvent,
  Param,
  NotFoundException,
  Query,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { RoomDataDto } from './dto/room-data.dto';
import { PaginatedRoomDto } from './dto/paginated-room.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Observable, Subject } from 'rxjs';
import { filter, concatMap } from 'rxjs';
import { RoomsConstant } from '../../common/constant';

@ApiTags('Rooms')
@Controller('rooms')
export class RoomController {
  private readonly logger = new Logger(RoomController.name);
  private readonly roomUpdateSubject = new Subject<MessageEvent>();

  constructor(private readonly redisService: RedisService) {
    this.redisService.subscribeToChannel('roomUpdate', async (message) => {
      this.logger.log(`게임방 업데이트 ${message}`);
      this.roomUpdateSubject.next({ data: message });
    });
  }

  @Sse('stream')
  @ApiOperation({
    summary: '게임 방 목록 조회하는 SSE',
    description: 'roomData가 변경되었을 시 변경된 room 배열을 전송합니다.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: '구독할 페이지 번호 (기본값: 0)',
    example: 0,
  })
  @ApiResponse({
    description: '현재 페이지의 게임 방 목록이 성공적으로 반환됩니다.',
    type: [RoomDataDto],
  })
  getRoomUpdates(
    @Query('page', ParseIntPipe) page: number = 0,
  ): Observable<MessageEvent> {
    const start = page * RoomsConstant.ROOMS_LIMIT;
    const end = start + RoomsConstant.ROOMS_LIMIT - 1;

    return this.roomUpdateSubject.pipe(
      concatMap(async (event: MessageEvent) => {
        const totalRooms = await this.redisService.llen('roomsList');
        const totalPages = Math.ceil(totalRooms / RoomsConstant.ROOMS_LIMIT);
        const roomList = await this.redisService.lrange(
          'roomsList',
          start,
          end,
        );

        const messageString = event.data as string;
        const message = JSON.parse(messageString);
        const { updatePage } = message;

        if (updatePage !== undefined && updatePage != page) {
          return null;
        }

        const rooms = await Promise.all(
          roomList.map(async (roomKey) => {
            const roomData = await this.redisService.hgetAll<RoomDataDto>(
              `room:${roomKey}`,
            );
            return roomData;
          }),
        );
        return {
          data: {
            rooms: rooms,
            pagination: {
              currentPage: Number(page),
              totalPages,
              totalItems: totalRooms,
              hasNextPage: page < totalPages - 1,
              hasPreviousPage: page > 0,
            },
          },
        } as MessageEvent;
      }),
      filter((event: MessageEvent) => event !== null),
    );
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
          return this.redisService.lrange(`roomNamesToIds:${roomName}`, 0, -1);
        }),
      )
    ).flat();

    this.logger.log(`roomData ${roomIds.length}개 반환`);
    return await Promise.all(
      roomIds.map(async (roomId) => {
        const roomData = await this.redisService.hgetAll<RoomDataDto>(
          `room:${roomId}`,
        );
        return roomData;
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
    const roomData = await this.redisService.hgetAll<RoomDataDto>(
      `room:${roomId}`,
    );

    if (!roomData) {
      this.logger.warn(`Room 조회 실패 - ID: ${roomId} (존재하지 않는 ID)`);
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }

    this.logger.log(`요청 완료 - Room 조회 성공: roomId=${roomId}`);
    return roomData;
  }

  @Get()
  @ApiOperation({
    summary: '게임 방 목록 조회',
    description:
      '저장된 모든 게임 방 목록을 페이지네이션으로 조회합니다. 페이지는 1부터 시작하며, 한 페이지에 최대 ROOM_LIMIT개의 방 정보를 반환합니다.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: '조회할 페이지 번호 (기본값: 0)',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '게임 방 목록이 성공적으로 반환됩니다.',
    schema: {
      example: {
        rooms: [
          {
            roomId: '6f42377f-42ea-42cc-ac1a-b5d2b99d4ced',
            roomName: '게임방123',
            hostNickname: 'hostNickname123',
            players: [
              { playerNickname: 'hostNic123', isReady: true, isMuted: false },
              { playerNickname: 'player1', isReady: false, isMuted: true },
            ],
            status: 'waiting',
          },
        ],
        pagination: {
          currentPage: 1,
          totalPages: 5,
          totalItems: 50,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      },
    },
  })
  async getRooms(@Query('page') page = 0): Promise<PaginatedRoomDto> {
    page = Number(page);
    this.logger.log(`게임 방 목록 조회 시작 (페이지: ${page})`);

    const totalRooms = await this.redisService.llen('roomsList');
    const totalPages = Math.ceil(totalRooms / RoomsConstant.ROOMS_LIMIT);
    const start = page * RoomsConstant.ROOMS_LIMIT;
    const end = start + RoomsConstant.ROOMS_LIMIT - 1;

    const paginatedKeys = await this.redisService.lrange(
      'roomsList',
      start,
      end,
    );

    const rooms = await Promise.all(
      paginatedKeys.map(async (key) => {
        const roomData = await this.redisService.hgetAll<RoomDataDto>(
          `room:${key}`,
        );
        if (!roomData || Object.keys(roomData).length === 0) {
          return null;
        }

        return {
          roomId: key,
          roomName: roomData.roomName,
          hostNickname: roomData.hostNickname,
          players: roomData.players,
          status: roomData.status,
        } as RoomDataDto;
      }),
    );
    const validRooms = rooms.filter((room) => room !== null);

    this.logger.log(`게임 방 목록 조회 완료, ${validRooms.length}개 방 반환`);

    return {
      rooms: validRooms,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalItems: totalRooms,
        hasNextPage: page < totalPages - 1,
        hasPreviousPage: page > 0,
      },
    };
  }

  @Delete('Error Messages')
  @ApiOperation({
    summary: '에러 메시지 목록',
    description: 'API에서 발생할 수 있는 에러 메시지 목록',
  })
  @ApiResponse({
    status: 200,
    description: '에러 메시지 목록',
    example: [
      'RoomNotFound: 방을 찾을 수 없음',
      'GameNotFound: 게임을 찾을 수 없음',
      'RoomFull: 방이 가득 참',
      'NicknameTaken: 닉네임이 이미 사용 중',
      'PlayerNotFound: 플레이어를 찾을 수 없음',
      'HostOnlyStart: 호스트만 게임을 시작할 수 있음',
      'InternalError: 내부 서버 오류',
      'AllPlayersMustBeReady: 모든 플레이어가 준비 상태여야 함',
      'NotEnoughPlayers: 플레이어가 충분하지 않음',
      'ValidationFailed: 유효하지 않은 입력값',
    ],
  })
  getErrorMessages() {
    return;
  }
}
