import { Test, TestingModule } from '@nestjs/testing';
import { GamesGateway } from './games.gateway';
import { RedisService } from '../../redis/redis.service';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { RoomDataDto } from '../rooms/dto/room-data.dto';

describe('GamesGateway', () => {
  let gateway: GamesGateway;
  let redisService: RedisService;
  let mockServer: Server;
  let mockHostClient: Socket;
  let mockLogger: Logger;

  beforeEach(async () => {
    const redisServiceMock = {
      set: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamesGateway,
        { provide: RedisService, useValue: redisServiceMock },
        { provide: Logger, useValue: mockLogger },
      ],
    }).compile();

    gateway = module.get<GamesGateway>(GamesGateway);
    redisService = module.get<RedisService>(RedisService);

    mockServer = {
      to: jest.fn().mockReturnValue({
        emit: jest.fn(),
      }),
    } as unknown as Server;

    mockHostClient = {
      emit: jest.fn(),
      data: {
        roomId: 'test-room-id',
        playerNickname: 'hostPlayer',
      },
    } as unknown as Socket;

    gateway.server = mockServer;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleStartGame', () => {
    it('모든 플레이어가 준비되지 않았을 경우 오류를 반환해야 한다.', async () => {
      const roomData: RoomDataDto = {
        roomId: 'test-room-id',
        roomName: 'testRoomName',
        hostNickname: 'hostPlayer',
        players: [
          { playerNickname: 'hostPlayer', isReady: true, isMuted: false },
          { playerNickname: 'player1', isReady: false, isMuted: false },
        ],
        status: 'waiting',
      };

      jest
        .spyOn(redisService, 'get')
        .mockResolvedValueOnce(JSON.stringify(roomData));

      await gateway.handleStartGame(mockHostClient);

      expect(redisService.get).toHaveBeenCalledWith('room:test-room-id');
      expect(mockHostClient.emit).toHaveBeenCalledWith(
        'error',
        'All players must be ready to start the game',
      );
    });

    it('호스트가 아닌 사용자가 게임 시작을 요청할 경우 오류를 반환해야 한다.', async () => {
      mockHostClient.data.playerNickname = 'notHostPlayer';

      const roomData: RoomDataDto = {
        roomId: 'test-room-id',
        roomName: 'testRoomName',
        hostNickname: 'hostPlayer',
        players: [
          { playerNickname: 'hostPlayer', isReady: true, isMuted: false },
          { playerNickname: 'player1', isReady: true, isMuted: false },
        ],
        status: 'waiting',
      };

      jest
        .spyOn(redisService, 'get')
        .mockResolvedValueOnce(JSON.stringify(roomData));

      await gateway.handleStartGame(mockHostClient);

      expect(redisService.get).toHaveBeenCalledWith('room:test-room-id');
      expect(mockHostClient.emit).toHaveBeenCalledWith(
        'error',
        'Only the host can start the game',
      );
    });

    it('Redis에서 방 정보를 찾을 수 없을 경우 오류를 반환해야 한다.', async () => {
      jest.spyOn(redisService, 'get').mockResolvedValueOnce(null);

      await gateway.handleStartGame(mockHostClient);

      expect(redisService.get).toHaveBeenCalledWith('room:test-room-id');
      expect(mockHostClient.emit).toHaveBeenCalledWith(
        'error',
        'Room not found',
      );
    });

    it('Redis에서 예외가 발생할 경우 오류를 반환해야 한다.', async () => {
      jest
        .spyOn(redisService, 'get')
        .mockRejectedValueOnce(new Error('Redis error'));

      await gateway.handleStartGame(mockHostClient);

      expect(mockHostClient.emit).toHaveBeenCalledWith('error', {
        message: 'Failed to start the game',
      });
    });
  });
});
