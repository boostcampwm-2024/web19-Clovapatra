import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  OnGatewayDisconnect,
  MessageBody,
} from '@nestjs/websockets';
import { OnModuleDestroy } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { RedisService } from '../../redis/redis.service';
import { Logger, UseFilters } from '@nestjs/common';
import { WsExceptionsFilter } from '../../common/filters/ws-exceptions.filter';
import { RoomDataDto } from '../rooms/dto/room-data.dto';
import { GameDataDto } from './dto/game-data.dto';
import { TurnDataDto } from './dto/turn-data.dto';
import { VoiceResultFromServerDto } from './dto/voice-result-from-server.dto';
import { ErrorResponse } from '../rooms/dto/error-response.dto';
import {
  createTurnData,
  selectCurrentPlayer,
  checkPlayersReady,
  removePlayerFromGame,
  noteToNumber,
  updatePreviousPlayers,
} from './games-utils';

const VOICE_SERVERS = 'voice-servers';
const PRONOUNCE_SCORE_THRESOLHD = 53;

@WebSocketGateway({
  namespace: '/rooms',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
@UseFilters(WsExceptionsFilter)
export class GamesGateway implements OnGatewayDisconnect, OnModuleDestroy {
  private readonly logger = new Logger(GamesGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private readonly redisService: RedisService) {}

  async onModuleDestroy() {
    this.logger.log('Module is being destroyed, cleaning up...');

    const gameKeys = await this.redisService.keys('game:*');
    for (const gameId of gameKeys) {
      await this.redisService.delete(`game:${gameId}`);
      this.logger.log(`Game ${gameId} data deleted from Redis`);
    }
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

      roomData.players.forEach((player) => {
        player.isReady = false;
      });
      this.server.to(roomId).emit('updateUsers', roomData.players);

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
        rank: [],
        currentTurn: 1,
        currentPlayer: selectCurrentPlayer(alivePlayers, []),
        previousPitch: 0,
        previousPlayers: [],
      };
      await this.redisService.set(`game:${roomId}`, JSON.stringify(gameData));

      const turnData: TurnDataDto = createTurnData(roomId, gameData);

      await new Promise<void>((resolve) => {
        this.server.to(VOICE_SERVERS).emit('turnChanged', turnData, () => {
          resolve();
        });
      });
      this.logger.log('Turn data sent to voice servers:', turnData);
      this.server.to(roomId).emit('turnChanged', turnData);
      this.logger.log('Turn data sent to clients in room:', roomId);

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

  @SubscribeMessage('next')
  async handleNext(@ConnectedSocket() client: Socket) {
    try {
      const { roomId } = client.data;

      const isProcessing = await this.redisService.get<string>(
        `next:${roomId}`,
      );
      if (isProcessing) {
        return;
      }
      await this.redisService.set(`next:${roomId}`, 'processing', undefined, 5);

      const gameDataString = await this.redisService.get<string>(
        `game:${roomId}`,
      );
      if (!gameDataString) {
        return client.emit('error', { message: `game ${roomId} not found` });
      }

      const gameData: GameDataDto = JSON.parse(gameDataString);

      if (gameData.alivePlayers.length > 1) {
        const turnData: TurnDataDto = createTurnData(roomId, gameData);

        await new Promise<void>((resolve) => {
          this.server.to(VOICE_SERVERS).emit('turnChanged', turnData, () => {
            resolve();
          });
        });
        this.logger.log('Turn data sent to voice servers:', turnData);

        this.server.to(roomId).emit('turnChanged', turnData);
        this.logger.log('Turn data sent to clients in room:', roomId);
      } else {
        this.server
          .to(roomId)
          .emit('endGame', [...gameData.alivePlayers, ...gameData.rank]);

        const roomDataString = await this.redisService.get<string>(
          `room:${roomId}`,
        );
        if (!roomDataString) {
          this.logger.warn(`Room not found: ${roomId}`);
          client.emit('error', 'Room not found');
          return;
        }
        const roomData: RoomDataDto = JSON.parse(roomDataString);
        roomData.status = 'waiting';
        await this.redisService.set(
          `room:${roomId}`,
          JSON.stringify(roomData),
          'roomUpdate',
        );

        this.logger.log('Game ended for room:', roomId);
        this.logger.log('Final rank:', [
          ...gameData.alivePlayers,
          ...gameData.rank,
        ]);

        await this.redisService.delete(`game:${roomId}`);
        this.logger.log(`${roomId} deleting game`);
      }
    } catch (error) {
      this.logger.error('Error handling next:', error);
      client.emit('error', { message: 'Internal server error' });
    }
  }

  @SubscribeMessage('voiceResult')
  async handleVoiceResult(
    @MessageBody() voiceResultFromServerDto: VoiceResultFromServerDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { roomId, playerNickname, averageNote, pronounceScore } =
        voiceResultFromServerDto;

      this.logger.log(
        `Received voice result for roomId: ${roomId}, player: ${playerNickname}, averageNote: ${averageNote}, pronounceScore: ${pronounceScore}`,
      );

      const gameDataString = await this.redisService.get<string>(
        `game:${roomId}`,
      );
      if (!gameDataString) {
        return client.emit('error', { message: `game ${roomId} not found` });
      }

      const gameData: GameDataDto = JSON.parse(gameDataString);

      if (averageNote !== undefined) {
        const note = noteToNumber(averageNote);
        this.logger.log(
          `Processing averageNote for player ${playerNickname}: ${note}`,
        );
        if (gameData.previousPitch < note) {
          this.logger.log(
            `Success: Player ${playerNickname} has a higher note (${note}) than required pitch.`,
          );
          this.server.to(roomId).emit('voiceProcessingResult', {
            playerNickname,
            result: 'PASS',
          });
          gameData.previousPitch = note;
        } else {
          this.logger.log(
            `Failure: Player ${playerNickname} failed to meet the required pitch.`,
          );
          this.server.to(roomId).emit('voiceProcessingResult', {
            playerNickname,
            result: 'FAIL',
          });
          removePlayerFromGame(gameData, playerNickname);
        }
      } else if (pronounceScore !== undefined) {
        this.logger.log(
          `Processing pronounceScore for player ${playerNickname}: ${pronounceScore}`,
        );
        if (pronounceScore >= PRONOUNCE_SCORE_THRESOLHD) {
          this.server.to(roomId).emit('voiceProcessingResult', {
            playerNickname,
            result: 'PASS',
          });
        } else {
          this.server.to(roomId).emit('voiceProcessingResult', {
            playerNickname,
            result: 'FAIL',
          });
          removePlayerFromGame(gameData, playerNickname);
        }
      } else {
        this.logger.log('pronounceScore nor averageNote');
      }
      updatePreviousPlayers(gameData, playerNickname);
      gameData.currentTurn++;
      this.logger.log(`Turn updated: ${gameData.currentTurn}`);
      gameData.currentPlayer = selectCurrentPlayer(
        gameData.alivePlayers,
        gameData.previousPlayers,
      );

      this.logger.log(
        `Saving updated game data to Redis for roomId: ${roomId}`,
      );
      await this.redisService.set(`game:${roomId}`, JSON.stringify(gameData));
    } catch (error) {
      this.logger.error('Error handling voiceResult:', error);
      client.emit('error', { message: 'Internal server error' });

      // 오류 일때
    }
  }

  @SubscribeMessage('disconnect')
  async handleDisconnect(@ConnectedSocket() client: Socket) {
    try {
      const { roomId, playerNickname } = client.data;
      const gameDataString = await this.redisService.get<string>(
        `game:${roomId}`,
      );

      if (!gameDataString) {
        this.logger.log(`Game not found: ${roomId}`);
        return;
      }

      const gameData: GameDataDto = JSON.parse(gameDataString);

      removePlayerFromGame(gameData, playerNickname);

      if (gameData.alivePlayers.length <= 0) {
        this.logger.log(`${roomId} deleting game`);
        await this.redisService.delete(`game:${roomId}`);
      } else {
        await this.redisService.set(`game:${roomId}`, JSON.stringify(gameData));
      }
      this.logger.log(`${playerNickname} leave game`);
    } catch (error) {
      this.logger.error('Error handling disconnect: ', error.message);
    }
  }
}
