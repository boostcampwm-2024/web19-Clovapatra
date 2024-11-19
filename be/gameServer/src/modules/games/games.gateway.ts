import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisService } from '../../redis/redis.service';
import { Logger, UseFilters } from '@nestjs/common';
import { WsExceptionsFilter } from '../../common/filters/ws-exceptions.filter';
import { RoomDataDto } from '../rooms/dto/room-data.dto';
import { GameDataDto } from './dto/game-data.dto';
import { TurnDataDto } from './dto/turn-data.dto';
import { ErrorResponse } from '../rooms/dto/error-response.dto';
import { io, Socket as ClientSocket } from 'socket.io-client';
import {
  createTurnData,
  selectCurrentPlayer,
  checkPlayersReady,
} from './games-utils';

@WebSocketGateway({
  namespace: '/rooms',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
@UseFilters(WsExceptionsFilter)
export class GamesGateway {
  private readonly logger = new Logger(GamesGateway.name);

  @WebSocketServer()
  server: Server;

  private voiceProcessingSocket: ClientSocket;

  constructor(private readonly redisService: RedisService) {
    this.voiceProcessingSocket = io(`wss://voice-processing.clovapatra.com`);
    this.voiceProcessingSocket.on('connect', () => {
      this.logger.log('Successfully connected to the voice processing server');
    });
  }

  @SubscribeMessage('startGame')
  async handleStartGame(@ConnectedSocket() client: Socket) {
    const { roomId, playerNickname } = client.data;
    this.logger.log(`Game start requested for room: ${roomId}`);

    try {
      const roomDataString = await this.redisService.get<string>(
        `room:${roomId}`,
      );

      if (!roomDataString) {
        this.logger.warn(`Room not found: ${roomId}`);
        client.emit('error', 'Room not found');
        return;
      }

      const roomData: RoomDataDto = JSON.parse(roomDataString);

      if (roomData.hostNickname !== playerNickname) {
        this.logger.warn(
          `User ${client.data.playerNickname} is not the host of room ${roomId}`,
        );
        client.emit('error', 'Only the host can start the game');
        return;
      }

      const allReady = checkPlayersReady(roomData);
      if (!allReady) {
        this.logger.warn(`Not all players are ready in room: ${roomId}`);
        client.emit('error', 'All players must be ready to start the game');
        return;
      }

      roomData.status = 'progress';

      await this.redisService.set(
        `room:${roomId}`,
        JSON.stringify(roomData),
        'roomUpdate',
      );

      const alivePlayers = roomData.players.map(
        (player) => player.playerNickname,
      );

      const gameData: GameDataDto = {
        gameId: roomId,
        alivePlayers,
        currentTurn: 1,
        currentPlayer: selectCurrentPlayer(alivePlayers),
        previousPitch: 0,
        previousPlayers: [],
      };
      await this.redisService.set(`game:${roomId}`, JSON.stringify(gameData));

      const turnData: TurnDataDto = createTurnData(roomData, gameData);

      this.server.to(roomId).emit('turnChanged', turnData);
      this.voiceProcessingSocket.emit('turnChanged', turnData);

      this.logger.log(`Game started successfully in room: ${roomId}`);
    } catch (error) {
      this.logger.error(
        `Error starting game in room ${roomId}: ${error.message}`,
      );
      const errorResponse: ErrorResponse = {
        message: 'Failed to start the game',
      };
      client.emit('error', errorResponse);
    }
  }
}
