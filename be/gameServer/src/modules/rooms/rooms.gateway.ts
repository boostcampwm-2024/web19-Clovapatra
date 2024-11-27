import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisService } from '../../redis/redis.service';
import { Logger, UseFilters } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomDataDto } from './dto/room-data.dto';
import { JoinRoomDto } from './dto/join-data.dto';
import { RoomsValidationPipe } from './rooms.validation.pipe';
import { WsExceptionsFilter } from '../../common/filters/ws-exceptions.filter';
import {
  isRoomFull,
  isNicknameTaken,
  removePlayerFromRoom,
  changeRoomHost,
  convertRoomDataToHash,
} from './room-utils';
import { v4 as uuidv4 } from 'uuid';
import { ErrorMessages, RedisKeys, RoomsConstant } from '../../common/constant';

@WebSocketGateway({
  namespace: '/rooms',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
@UseFilters(WsExceptionsFilter)
export class RoomsGateway implements OnGatewayDisconnect {
  private readonly logger = new Logger(RoomsGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private readonly redisService: RedisService) {}

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

      await this.redisService.rpush(RedisKeys.ROOMS_LIST, roomId);
      await this.redisService.hmset<string>(
        `room:${roomId}`,
        convertRoomDataToHash(roomData),
        RedisKeys.ROOMS_UPDATE_CHANNEL,
      );
      await this.redisService.rpush(
        `${RedisKeys.ROOM_NAME_TO_ID_HASH}:${roomName}`,
        roomId,
      );
      await this.redisService.zadd(
        RedisKeys.ROOM_NAMES_SORTED_KEY,
        0,
        roomName,
      );

      client.join(roomId);
      client.data = { roomId, playerNickname: hostNickname };
      this.logger.log(`Room created successfully: ${roomId}`);

      client.emit('roomCreated', roomData);
    } catch (error) {
      this.logger.error('Error creating room:', error.message);

      client.emit('error', ErrorMessages.INTERNAL_ERROR);
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
      const roomData = await this.redisService.hgetAll<RoomDataDto>(
        `room:${roomId}`,
      );

      if (!roomData || Object.keys(roomData).length === 0) {
        this.logger.warn(`Room ${roomId} does not exist`);
        client.emit('error', ErrorMessages.ROOM_NOT_FOUND);
        return;
      }

      if (isRoomFull(roomData)) {
        this.logger.log(`Room ${roomId} is full`);
        client.emit('error', ErrorMessages.ROOM_FULL);
        return;
      }

      if (isNicknameTaken(roomData, playerNickname)) {
        this.logger.warn(`Nickname already taken: ${playerNickname}`);
        client.emit('error', ErrorMessages.NICKNAME_TAKEN);
        return;
      }

      roomData.players.push({ playerNickname, isReady: false, isMuted: false });
      await this.redisService.hmset(
        `room:${roomId}`,
        {
          players: JSON.stringify(roomData.players),
        },
        RedisKeys.ROOMS_UPDATE_CHANNEL,
      );

      client.join(roomId);
      client.data = { roomId, playerNickname: playerNickname };
      this.server.to(roomId).emit('updateUsers', roomData.players);

      this.logger.log(`User ${playerNickname} joined room ${roomId}`);
    } catch (error) {
      this.logger.error(`Error joining room: ${error.message}`, error.stack);
      client.emit('error', ErrorMessages.INTERNAL_ERROR);
    }
  }

  @SubscribeMessage('disconnect')
  async handleDisconnect(@ConnectedSocket() client: Socket) {
    try {
      const { roomId, playerNickname } = client.data;
      const roomData = await this.redisService.hgetAll<RoomDataDto>(
        `room:${roomId}`,
      );

      if (!roomData || Object.keys(roomData).length === 0) {
        this.logger.warn(`Room ${roomId} does not exist`);
        client.emit('error', ErrorMessages.ROOM_NOT_FOUND);
        return;
      }

      removePlayerFromRoom(roomData, playerNickname);

      // todo
      // 이 상태에서 다른 사용자가 방에 들어온다면?

      if (roomData.hostNickname === playerNickname) {
        if (roomData.players.length > 0) {
          changeRoomHost(roomData);
          await this.redisService.hmset(
            `room:${roomId}`,
            {
              players: JSON.stringify(roomData.players),
              hostNickname: roomData.hostNickname,
            },
            RedisKeys.ROOMS_UPDATE_CHANNEL,
          );

          this.logger.log(`host ${playerNickname} leave room`);
          this.logger.log(
            `host changed to ${roomData.players[0].playerNickname}`,
          );
          this.server.to(roomId).emit('updateUsers', roomData.players);
        } else {
          this.logger.log(`${roomId} deleting room`);
          await this.redisService.lrem(
            `${RedisKeys.ROOM_NAME_TO_ID_HASH}:${roomData.roomName}`,
            roomId,
          );
          const roomNameList = await this.redisService.lrange(
            `${RedisKeys.ROOM_NAME_TO_ID_HASH}:${roomData.roomName}`,
            0,
            -1,
          );
          if (roomNameList.length === 0) {
            await this.redisService.zrem('roomNames', roomData.roomName);
          }
          const totalRoomIdList = await this.redisService.lrange(
            `${RedisKeys.ROOMS_LIST}`,
            0,
            -1,
          );
          const index = totalRoomIdList.indexOf(roomId);
          await this.redisService.lrem(RedisKeys.ROOMS_LIST, roomId);
          await this.redisService.delete(
            `room:${roomId}`,
            RedisKeys.ROOMS_UPDATE_CHANNEL,
            ...(index === -1
              ? []
              : [Math.floor(index / RoomsConstant.ROOMS_LIMIT)]),
          );
        }
      } else {
        await this.redisService.hmset(
          `room:${roomId}`,
          {
            players: JSON.stringify(roomData.players),
          },
          RedisKeys.ROOMS_UPDATE_CHANNEL,
        );
        this.logger.log(`host ${playerNickname} leave room`);
        this.server.to(roomId).emit('updateUsers', roomData.players);
      }
    } catch (error) {
      this.logger.error('Error handling disconnect: ', error.message);
      client.emit('error', ErrorMessages.INTERNAL_ERROR);
    }
  }

  @SubscribeMessage('setReady')
  async handleSetReady(@ConnectedSocket() client: Socket) {
    try {
      const { roomId, playerNickname } = client.data;
      const roomData = await this.redisService.hgetAll<RoomDataDto>(
        `room:${roomId}`,
      );

      if (!roomData || Object.keys(roomData).length === 0) {
        this.logger.warn(`Room ${roomId} does not exist`);
        client.emit('error', ErrorMessages.ROOM_NOT_FOUND);
        return;
      }

      const player = roomData.players.find(
        (p) => p.playerNickname === playerNickname,
      );

      if (player) {
        player.isReady = !player.isReady;
        await this.redisService.hmset(`room:${roomId}`, {
          players: JSON.stringify(roomData.players),
        });
        this.server.to(roomId).emit('updateUsers', roomData.players);
      } else {
        client.emit('error', ErrorMessages.PLAYER_NOT_FOUND);
      }
    } catch (error) {
      this.logger.error(`Error setting ready status: ${error.message}`);
      client.emit('error', ErrorMessages.INTERNAL_ERROR);
    }
  }

  @SubscribeMessage('setMute')
  async handleSetMute(@ConnectedSocket() client: Socket) {
    try {
      const { roomId, playerNickname } = client.data;
      const roomData = await this.redisService.hgetAll<RoomDataDto>(
        `room:${roomId}`,
      );

      if (!roomData || Object.keys(roomData).length === 0) {
        this.logger.warn(`Room ${roomId} does not exist`);
        client.emit('error', ErrorMessages.ROOM_NOT_FOUND);
        return;
      }

      const player = roomData.players.find(
        (p) => p.playerNickname === playerNickname,
      );

      if (player) {
        player.isMuted = !player.isMuted;
        await this.redisService.hmset(`room:${roomId}`, {
          players: JSON.stringify(roomData.players),
        });
        // this.server.to(roomId).emit('updateUsers', roomData.players);
        const muteStatus = roomData.players.reduce((acc, player) => {
          acc[player.playerNickname] = player.isMuted;
          return acc;
        }, {});

        this.server.to(roomId).emit('muteStatusChanged', muteStatus);
      } else {
        client.emit('error', ErrorMessages.PLAYER_NOT_FOUND);
      }
    } catch (error) {
      this.logger.error(`Error setting mute status: ${error.message}`);
      client.emit('error', ErrorMessages.INTERNAL_ERROR);
    }
  }

  @SubscribeMessage('kickPlayer')
  async handleKickPlayer(
    @MessageBody() playerNickname: string,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { roomId } = client.data;
      const roomData = await this.redisService.hgetAll<RoomDataDto>(
        `room:${roomId}`,
      );

      if (!roomData || Object.keys(roomData).length === 0) {
        this.logger.warn(`Room ${roomId} does not exist`);
        client.emit('error', ErrorMessages.ROOM_NOT_FOUND);
        return;
      }

      if (roomData.hostNickname !== client.data.playerNickname) {
        client.emit('error', ErrorMessages.ONLY_HOST_CAN_START);
        return;
      }

      const playerIndex = roomData.players.findIndex(
        (p) => p.playerNickname === playerNickname,
      );

      if (playerIndex === -1) {
        client.emit('error', ErrorMessages.PLAYER_NOT_FOUND);
        return;
      }

      const socketsInRoom = await this.server.in(roomId).fetchSockets();
      const targetSocket = socketsInRoom.find(
        (socket) => socket.data.playerNickname === playerNickname,
      );

      if (targetSocket) {
        roomData.players.splice(playerIndex, 1);
        await this.redisService.hmset(
          `room:${roomId}`,
          {
            players: JSON.stringify(roomData.players),
          },
          RedisKeys.ROOMS_UPDATE_CHANNEL,
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
      client.emit('error', ErrorMessages.INTERNAL_ERROR);
    }
  }
}
