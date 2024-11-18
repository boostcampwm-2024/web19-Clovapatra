import { Test, TestingModule } from '@nestjs/testing';
import { RoomsGateway } from './rooms.gateway';
import { RedisService } from '../../redis/redis.service';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { CreateRoomDto } from './dto/create-room.dto';
import { JoinRoomDto } from './dto/join-data.dto';
import { RoomDataDto } from './dto/room-data.dto';

describe('RoomsGateway', () => {
  let gateway: RoomsGateway;
  let redisService: RedisService;
  let mockServer: Server;
  let mockClient: Socket;

  beforeEach(async () => {
    const redisServiceMock = {
      set: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomsGateway,
        { provide: RedisService, useValue: redisServiceMock },
        Logger,
      ],
    }).compile();

    gateway = module.get<RoomsGateway>(RoomsGateway);
    redisService = module.get<RedisService>(RedisService);

    mockServer = {
      to: jest.fn().mockReturnValue({
        emit: jest.fn(),
      }),
    } as unknown as Server;

    mockClient = {
      emit: jest.fn(),
      join: jest.fn(),
      to: jest.fn().mockReturnValue({
        emit: jest.fn(),
      }),
      data: {},
    } as unknown as Socket;

    gateway.server = mockServer;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleCreateRoom', () => {
    it('새로운 방을 생성하고 Redis에 저장해야 한다.', async () => {
      const createRoomDto: CreateRoomDto = {
        roomName: 'Test Room',
        hostNickname: 'HostUser',
      };
      mockClient.data = {};

      await gateway.handleCreateRoom(createRoomDto, mockClient);

      expect(redisService.set).toHaveBeenCalledWith(
        expect.stringMatching(/^room:/),
        expect.any(String),
        'roomUpdate',
      );
      expect(mockClient.join).toHaveBeenCalledWith(expect.any(String));
      expect(mockClient.emit).toHaveBeenCalledWith(
        'roomCreated',
        expect.objectContaining({
          roomId: expect.any(String),
          roomName: createRoomDto.roomName,
          hostNickname: createRoomDto.hostNickname,
          players: expect.arrayContaining([createRoomDto.hostNickname]),
          status: 'waiting',
        }),
      );
    });

    it('Redis 오류로 인해 방 생성이 실패하면 오류를 반환해야 한다.', async () => {
      jest
        .spyOn(redisService, 'set')
        .mockRejectedValue(new Error('Redis error'));

      await gateway.handleCreateRoom(
        { roomName: 'Fail Room', hostNickname: 'Host' },
        mockClient,
      );

      expect(mockClient.emit).toHaveBeenCalledWith('error', {
        message: 'Failed to create the room',
      });
    });

    it('hostNickname이 유효하지 않으면 오류를 반환해야 한다.', async () => {
      const createRoomDto: CreateRoomDto = {
        roomName: 'Room Name',
        hostNickname: 'HostHostHostHost',
      };

      try {
        await gateway.handleCreateRoom(createRoomDto, mockClient);
      } catch (error) {
        console.error('Validation failed error:', error);

        expect(mockClient.emit).toHaveBeenCalledWith('error', {
          message: 'Validation failed.',
          details: expect.any(Array),
        });

        expect(redisService.set).not.toHaveBeenCalled();
        expect(mockClient.join).not.toHaveBeenCalled();
      }
    });
  });

  describe('handleJoinRoom', () => {
    it('방이 꽉 차지 않고 닉네임이 유효하면 사용자가 방에 입장할 수 있어야 한다.', async () => {
      const roomId = 'testRoomId';
      const playerNickname = 'Player1';
      const roomData = {
        roomId,
        players: ['host'],
      };

      jest
        .spyOn(redisService, 'get')
        .mockResolvedValueOnce(JSON.stringify(roomData));

      const joinRoomDto: JoinRoomDto = { roomId, playerNickname };

      await gateway.handleJoinRoom(joinRoomDto, mockClient);

      expect(mockClient.join).toHaveBeenCalledWith(roomId);
      expect(mockClient.data.roomId).toBe(roomId);
      expect(mockClient.data.nickname).toBe(playerNickname);
      expect(mockClient.to(roomId).emit).toHaveBeenCalledWith('updateUsers', [
        'host',
        playerNickname,
      ]);
      expect(redisService.set).toHaveBeenCalledWith(
        `room:${roomId}`,
        JSON.stringify({
          roomId,
          players: ['host', playerNickname],
        }),
        'roomUpdate',
      );
    });

    it('닉네임이 유효하지 않으면 오류를 반환해야 한다.', async () => {
      const roomId = 'testRoomId';
      const playerNickname = 'testPlayertestPlayertestPlayer';

      const joinRoomDto: JoinRoomDto = { roomId, playerNickname };

      try {
        await gateway.handleJoinRoom(joinRoomDto, mockClient);
      } catch (error) {
        console.error('Validation failed error:', error);

        expect(mockClient.emit).toHaveBeenCalledWith('error', {
          message: 'Validation failed.',
          details: expect.any(Array),
        });

        expect(redisService.get).not.toHaveBeenCalled();
        expect(mockClient.join).not.toHaveBeenCalled();
      }
    });

    it('닉네임이 이미 사용 중이면 오류를 반환해야 한다.', async () => {
      const roomId = 'testRoomId';
      const playerNickname = 'host';
      const roomData = {
        roomId,
        players: ['host'],
      };

      jest
        .spyOn(redisService, 'get')
        .mockResolvedValueOnce(JSON.stringify(roomData));

      const joinRoomDto: JoinRoomDto = { roomId, playerNickname };

      await gateway.handleJoinRoom(joinRoomDto, mockClient);

      expect(mockClient.emit).toHaveBeenCalledWith(
        'error',
        'Nickname already taken in this room',
      );
    });

    it('방이 꽉 차 있으면 오류를 반환해야 한다.', async () => {
      const roomId = 'testRoomId';
      const playerNickname = 'Player1';
      const roomData = {
        roomId,
        players: ['host', 'Player2', 'Player3', 'Player4'],
      };

      jest
        .spyOn(redisService, 'get')
        .mockResolvedValueOnce(JSON.stringify(roomData));

      const joinRoomDto: JoinRoomDto = { roomId, playerNickname };

      await gateway.handleJoinRoom(joinRoomDto, mockClient);

      expect(mockClient.emit).toHaveBeenCalledWith('error', 'Room is full');
    });

    it('Redis에서 방 데이터를 가져오는 데 실패하면 오류를 반환해야 한다.', async () => {
      const roomId = 'testRoomId';
      const playerNickname = 'Player1';

      jest
        .spyOn(redisService, 'get')
        .mockRejectedValueOnce(new Error('Redis error'));

      const joinRoomDto: JoinRoomDto = { roomId, playerNickname };

      await gateway.handleJoinRoom(joinRoomDto, mockClient);

      expect(mockClient.emit).toHaveBeenCalledWith('error', {
        message: 'Failed to join the room',
      });
    });
  });

  describe('handleDisconnect', () => {
    it('사용자가 방을 떠나면 방의 사용자 목록이 업데이트되어야 한다.', async () => {
      const roomId = 'testRoomId';
      const nickname = 'Player1';
      const roomData: RoomDataDto = {
        roomId,
        roomName: 'testRoom',
        players: ['host', 'Player1'],
        hostNickname: 'host',
        status: 'wating',
      };

      jest
        .spyOn(redisService, 'get')
        .mockResolvedValueOnce(JSON.stringify(roomData));

      mockClient.data = { roomId, nickname };

      await gateway.handleDisconnect(mockClient);

      expect(redisService.set).toHaveBeenCalledWith(
        `room:${roomId}`,
        JSON.stringify({
          roomId,
          roomName: 'testRoom',
          players: ['host'],
          hostNickname: 'host',
          status: 'wating',
        }),
        'roomUpdate',
      );

      expect(mockServer.to(roomId).emit).toHaveBeenCalledWith('updateUsers', [
        'host',
      ]);
    });

    it('호스트가 나가면 새로운 호스트가 지정되어야 한다.', async () => {
      const roomId = 'testRoomId';
      const nickname = 'host';
      const roomData: RoomDataDto = {
        roomId,
        roomName: 'testRoom',
        players: ['host', 'Player1'],
        hostNickname: 'host',
        status: 'wating',
      };

      jest
        .spyOn(redisService, 'get')
        .mockResolvedValueOnce(JSON.stringify(roomData));

      mockClient.data = { roomId, nickname };

      await gateway.handleDisconnect(mockClient);

      expect(redisService.set).toHaveBeenCalledWith(
        `room:${roomId}`,
        JSON.stringify({
          roomId,
          roomName: 'testRoom',
          players: ['Player1'],
          hostNickname: 'Player1',
          status: 'wating',
        }),
        'roomUpdate',
      );

      expect(mockServer.to(roomId).emit).toHaveBeenCalledWith('updateUsers', [
        'Player1',
      ]);
    });

    it('방에 사용자가 하나만 남았을 때 방을 삭제해야 한다.', async () => {
      const roomId = 'testRoomId';
      const nickname = 'host';
      const roomData = {
        roomId,
        roomName: 'testRoom',
        players: ['host'],
        hostNickname: 'host',
        status: 'wating',
      };

      jest
        .spyOn(redisService, 'get')
        .mockResolvedValueOnce(JSON.stringify(roomData));

      mockClient.data = { roomId, nickname };

      await gateway.handleDisconnect(mockClient);

      expect(redisService.delete).toHaveBeenCalledWith(
        `room:${roomId}`,
        'roomUpdate',
      );

      expect(mockServer.to(roomId).emit).not.toHaveBeenCalled();
    });

    it('Redis에서 방 데이터를 가져오는 데 실패하면 오류를 반환해야 한다.', async () => {
      const roomId = 'testRoomId';
      const nickname = 'Player1';

      jest
        .spyOn(redisService, 'get')
        .mockRejectedValueOnce(new Error('Redis error'));

      mockClient.data = { roomId, nickname };

      await gateway.handleDisconnect(mockClient);

      expect(mockClient.emit).toHaveBeenCalledWith('error', {
        message: 'Failed to handle disconnect',
      });
    });

    it('방 데이터가 없으면 로그만 기록 후 오류를 반환하지 않아야 한다.', async () => {
      const roomId = 'testRoomId';
      const nickname = 'Player1';

      jest.spyOn(redisService, 'get').mockResolvedValueOnce(null);

      mockClient.data = { roomId, nickname };

      await gateway.handleDisconnect(mockClient);

      expect(mockClient.emit).not.toHaveBeenCalled();
    });
  });
});
