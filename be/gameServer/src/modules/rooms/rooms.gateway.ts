import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { OnModuleDestroy } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { RedisService } from '../../redis/redis.service';
import { Logger, UseFilters } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomDataDto } from './dto/room-data.dto';
import { JoinRoomDto } from './dto/join-data.dto';
import { ErrorResponse } from './dto/error-response.dto';
import { RoomsValidationPipe } from './rooms.validation.pipe';
import { WsExceptionsFilter } from '../../common/filters/ws-exceptions.filter';
import {
  isRoomFull,
  isNicknameTaken,
  removePlayerFromRoom,
  changeRoomHost,
} from './room-utils';
import { v4 as uuidv4 } from 'uuid';

@WebSocketGateway({
  namespace: '/rooms',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
@UseFilters(WsExceptionsFilter)
export class RoomsGateway implements OnGatewayDisconnect, OnModuleDestroy {
  private readonly logger = new Logger(RoomsGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private readonly redisService: RedisService) {}

  async onModuleDestroy() {
    this.logger.log('Module is being destroyed, cleaning up...');

    const roomKeys = await this.redisService.keys('room:*');
    for (const roomId of roomKeys) {
      await this.redisService.delete(`room:${roomId}`);
      this.logger.log(`Room ${roomId} data deleted from Redis`);
    }
  }

  @SubscribeMessage('createRoom')
  async handleCreateRoom(
    @MessageBody(new RoomsValidationPipe()) createRoomDto: CreateRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { roomName, hostNickname } = createRoomDto;
      this.logger.log(
        `Room creation requested: ${roomName} by ${hostNickname}`,
      );

      const roomId = uuidv4();
      const roomData: RoomDataDto = {
        roomId,
        roomName,
        hostNickname,
        players: [
          { playerNickname: hostNickname, isReady: false, isMuted: false },
        ],
        status: 'waiting',
      };
      await this.redisService.set(
        `room:${roomId}`,
        JSON.stringify(roomData),
        'roomUpdate',
      );

      // roomName으로 id 검색을 위한 키 (방 이름 중복 허용)
      await this.redisService.rpush(`roomName:${roomName}`, roomId);
      await this.redisService.zadd('roomNames', 0, roomName);

      client.join(roomId);
      client.data = { roomId, playerNickname: hostNickname };
      this.logger.log(`Room created successfully: ${roomId}`);

      client.emit('roomCreated', roomData);
    } catch (error) {
      this.logger.error('Error creating room:', error.message);
      const errorResponse: ErrorResponse = {
        message: 'Failed to create the room',
      };

      client.emit('error', errorResponse);
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody(new RoomsValidationPipe()) joinRoomDto: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, playerNickname } = joinRoomDto;
    this.logger.log(`Join room requested: ${roomId} by ${playerNickname}`);

    try {
      const roomDataString = await this.redisService.get<string>(
        `room:${roomId}`,
      );

      const roomData: RoomDataDto = JSON.parse(roomDataString);

      if (isRoomFull(roomData)) {
        this.logger.log(`Room ${roomId} is full`);
        client.emit('error', 'Room is full');
        return;
      }

      if (isNicknameTaken(roomData, playerNickname)) {
        this.logger.warn(`Nickname already taken: ${playerNickname}`);
        client.emit('error', 'Nickname already taken in this room');
        return;
      }

      roomData.players.push({ playerNickname, isReady: false, isMuted: false });
      await this.redisService.set(
        `room:${roomId}`,
        JSON.stringify(roomData),
        'roomUpdate',
      );

      client.join(roomId);
      client.data = { roomId, playerNickname: playerNickname };
      this.server.to(roomId).emit('updateUsers', roomData.players);

      this.logger.log(`User ${playerNickname} joined room ${roomId}`);
    } catch (error) {
      this.logger.error(`Error joining room: ${error.message}`, error.stack);

      const errorResponse: ErrorResponse = {
        message: 'Failed to join the room',
      };

      client.emit('error', errorResponse);
    }
  }

  @SubscribeMessage('disconnect')
  async handleDisconnect(@ConnectedSocket() client: Socket) {
    try {
      const { roomId, playerNickname } = client.data;
      const roomDataString = await this.redisService.get<string>(
        `room:${roomId}`,
      );

      if (!roomDataString) {
        this.logger.log(`Room not found: ${roomId}`);
        return;
      }

      const roomData: RoomDataDto = JSON.parse(roomDataString);

      removePlayerFromRoom(roomData, playerNickname);

      // todo
      // 이 상태에서 다른 사용자가 방에 들어온다면?

      if (roomData.hostNickname === playerNickname) {
        if (roomData.players.length > 0) {
          changeRoomHost(roomData);
          await this.redisService.set(
            `room:${roomId}`,
            JSON.stringify(roomData),
            'roomUpdate',
          );

          this.logger.log(`host ${playerNickname} leave room`);
          this.logger.log(
            `host changed to ${roomData.players[0].playerNickname}`,
          );
          this.server.to(roomId).emit('updateUsers', roomData.players);
        } else {
          this.logger.log(`${roomId} deleting room`);
          await this.redisService.delete(`room:${roomId}`, 'roomUpdate');
          await this.redisService.lrem(`roomName:${roomData.roomName}`, roomId);
          const roomList = await this.redisService.lrange(
            `roomName:${roomData.roomName}`,
            0,
            -1,
          );
          if (roomList.length === 0) {
            await this.redisService.zrem('roomNames', roomData.roomName);
          }
        }
      } else {
        await this.redisService.set(
          `room:${roomId}`,
          JSON.stringify(roomData),
          'roomUpdate',
        );
        this.logger.log(`host ${playerNickname} leave room`);
        this.server.to(roomId).emit('updateUsers', roomData.players);
      }
    } catch (error) {
      this.logger.error('Error handling disconnect: ', error.message);
      const errorResponse: ErrorResponse = {
        message: 'Failed to handle disconnect',
      };

      client.emit('error', errorResponse);
    }
  }

  @SubscribeMessage('setReady')
  async handleSetReady(@ConnectedSocket() client: Socket) {
    try {
      const { roomId, playerNickname } = client.data;
      const roomDataString = await this.redisService.get<string>(
        `room:${roomId}`,
      );
      const roomData: RoomDataDto = JSON.parse(roomDataString);

      const player = roomData.players.find(
        (p) => p.playerNickname === playerNickname,
      );

      if (player) {
        player.isReady = !player.isReady;
        await this.redisService.set(`room:${roomId}`, JSON.stringify(roomData));
        this.server.to(roomId).emit('updateUsers', roomData.players);
      } else {
        client.emit('error', 'Player not found in room');
      }
    } catch (error) {
      this.logger.error(`Error setting ready status: ${error.message}`);
      client.emit('error', 'Failed to set ready status');
    }
  }

  @SubscribeMessage('setMute')
  async handleSetMute(@ConnectedSocket() client: Socket) {
    try {
      const { roomId, playerNickname } = client.data;
      const roomDataString = await this.redisService.get<string>(
        `room:${roomId}`,
      );
      const roomData: RoomDataDto = JSON.parse(roomDataString);

      const player = roomData.players.find(
        (p) => p.playerNickname === playerNickname,
      );

      if (player) {
        player.isMuted = !player.isMuted;
        await this.redisService.set(`room:${roomId}`, JSON.stringify(roomData));
        this.server.to(roomId).emit('updateUsers', roomData.players);
      } else {
        client.emit('error', 'Player not found in room');
      }
    } catch (error) {
      this.logger.error(`Error setting ready status: ${error.message}`);
      client.emit('error', 'Failed to set ready status');
    }
  }

  @SubscribeMessage('kickPlayer')
  async handleKickPlayer(
    @MessageBody() playerNickname: string,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { roomId } = client.data;
      const roomDataString = await this.redisService.get<string>(
        `room:${roomId}`,
      );
      const roomData: RoomDataDto = JSON.parse(roomDataString);

      if (roomData.hostNickname !== client.data.playerNickname) {
        client.emit('error', 'Only host can kick players');
        return;
      }

      const playerIndex = roomData.players.findIndex(
        (p) => p.playerNickname === playerNickname,
      );

      if (playerIndex === -1) {
        client.emit('error', 'Player not found in room');
        return;
      }

      const socketsInRoom = await this.server.in(roomId).fetchSockets();
      const targetSocket = socketsInRoom.find(
        (socket) => socket.data.playerNickname === playerNickname,
      );

      if (targetSocket) {
        roomData.players.splice(playerIndex, 1);
        await this.redisService.set(
          `room:${roomId}`,
          JSON.stringify(roomData),
          'roomUpdate',
        );

        this.server.to(roomId).emit('kicked', playerNickname);
        this.server.to(roomId).emit('updateUsers', roomData.players);

        targetSocket.disconnect(true);
        this.logger.log(
          `Player ${playerNickname} disconnected from room ${roomId}`,
        );
        this.logger.log(`Player ${playerNickname} kicked from room ${roomId}`);
      }
    } catch (error) {
      this.logger.error(`Error kicking player: ${error.message}`);
      client.emit('error', 'Failed to kick player');
    }
  }
}
