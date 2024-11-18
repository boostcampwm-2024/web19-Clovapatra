import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { io as Client, Socket } from 'socket.io-client';
import { RedisService } from '../src/redis/redis.service';

describe('RoomsGateway (e2e)', () => {
  let app: INestApplication;
  let clientSocket: Socket;
  let redisService: RedisService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    redisService = moduleFixture.get<RedisService>(RedisService);
    await app.init();

    clientSocket = Client('ws://localhost:8000/rooms', {
      transports: ['websocket'],
    });
  });

  afterAll(async () => {
    clientSocket.close();
    await redisService.flushAll();
    await redisService['redisClient'].quit();
    await app.close();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await redisService.flushAll(); // Redis 초기화
  });

  describe('WebSocket Rooms Gateway', () => {
    it('사용자가 방을 생성할 수 있어야 한다.', async () => {
      const roomData = {
        roomName: 'Test Room',
        hostNickname: 'HostUser',
      };

      clientSocket.emit('createRoom', roomData);

      clientSocket.on('roomCreated', async (response) => {
        expect(response).toMatchObject({
          roomId: expect.any(String),
          roomName: roomData.roomName,
          hostNickname: roomData.hostNickname,
          players: [roomData.hostNickname],
          status: 'waiting',
        });

        const redisData = await redisService.get<string>(
          `room:${response.roomId}`,
        );
        expect(redisData).toBeDefined();
        const parsedData = JSON.parse(redisData);
        expect(parsedData.roomName).toBe(roomData.roomName);
        expect(parsedData.hostNickname).toBe(roomData.hostNickname);
      });
    });

    it('사용자가 방에 참가할 수 있어야 한다.', async () => {
      const roomId = 'testRoom';
      const roomData = {
        roomId,
        roomName: 'Test Room',
        hostNickname: 'HostUser',
        players: ['HostUser'],
        status: 'waiting',
      };

      redisService.set(`room:${roomId}`, JSON.stringify(roomData));

      const joinRoomData = {
        roomId,
        playerNickname: 'Player1',
      };

      clientSocket.emit('joinRoom', joinRoomData);

      clientSocket.on('updateUsers', async (players) => {
        expect(players).toEqual(['HostUser', 'Player1']);

        const redisData = await redisService.get<string>(`room:${roomId}`);
        const updatedRoom = JSON.parse(redisData);
        expect(updatedRoom.players).toContain('Player1');
      });
    });

    it('방이 비면 삭제되어야 한다.', async () => {
      const roomId = 'testRoom';
      const roomData = {
        roomId,
        roomName: 'Test Room',
        hostNickname: 'HostUser',
        players: ['HostUser'],
        status: 'waiting',
      };

      redisService.set(`room:${roomId}`, JSON.stringify(roomData));

      clientSocket.close();

      setTimeout(async () => {
        const redisData = await redisService.get(`room:${roomId}`);
        expect(redisData).toBeNull();
      }, 100);
    });

    it('플레이어가 준비 상태로 설정될 수 있어야 한다.', async () => {
      const roomId = 'testRoom';
      const roomData = {
        roomId,
        roomName: 'Test Room',
        hostNickname: 'HostUser',
        players: [
          { playerNickname: 'HostUser', isReady: false },
          { playerNickname: 'Player1', isReady: false },
        ],
        status: 'waiting',
      };

      await redisService.set(`room:${roomId}`, JSON.stringify(roomData));

      clientSocket.emit('setReady', 'Player1');

      clientSocket.on('updateUsers', async (players) => {
        expect(players).toEqual([
          { playerNickname: 'HostUser', isReady: false },
          { playerNickname: 'Player1', isReady: true },
        ]);

        const redisData = await redisService.get<string>(`room:${roomId}`);
        const updatedRoom = JSON.parse(redisData);
        expect(updatedRoom.players[1].isReady).toBe(true);
      });
    });

    it('호스트가 플레이어를 강퇴할 수 있어야 한다.', async () => {
      const roomId = 'testRoom';
      const roomData = {
        roomId,
        roomName: 'Test Room',
        hostNickname: 'HostUser',
        players: [
          { playerNickname: 'HostUser', isReady: false },
          { playerNickname: 'Player1', isReady: false },
        ],
        status: 'waiting',
      };

      await redisService.set(`room:${roomId}`, JSON.stringify(roomData));

      clientSocket.on('updateUsers', async (players) => {
        expect(players).toEqual([
          { playerNickname: 'HostUser', isReady: false },
        ]);

        const redisData = await redisService.get<string>(`room:${roomId}`);
        const updatedRoom = JSON.parse(redisData);
        expect(updatedRoom.players.length).toBe(1);
        expect(updatedRoom.players[0].playerNickname).toBe('HostUser');
      });

      clientSocket.emit('kickPlayer', 'Player1');
    });
  });
});
