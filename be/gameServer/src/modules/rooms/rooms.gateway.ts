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
import { Logger } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomDataDto } from './dto/room-data.dto';
import { JoinRoomDto } from './dto/join-data.dto';
import { v4 as uuidv4 } from 'uuid';

// todo: pipe or fillter 사용하여 예외상황처리

@WebSocketGateway({
  namespace: '/rooms',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class RoomsGateway implements OnGatewayDisconnect {
  private readonly logger = new Logger(RoomsGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private readonly redisService: RedisService) {}

  @SubscribeMessage('createRoom')
  async handleCreateRoom(
    @MessageBody() createRoomDto: CreateRoomDto,
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
        players: [hostNickname],
        status: 'waiting',
      };
      await this.redisService.set(`room:${roomId}`, JSON.stringify(roomData));
      client.join(roomId);
      client.data = { roomId, nickname: hostNickname };
      this.logger.log(`Room created successfully: ${roomId}`);

      client.emit('roomCreated', roomData);
    } catch (error) {
      this.logger.error(`Error creating room: ${error.message}`, error.stack);
      client.emit('error', 'Failed to create the room');
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() joinRoomDto: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, playerNickname } = joinRoomDto;
    this.logger.log(`Join room requested: ${roomId} by ${playerNickname}`);

    try {
      const roomDataString = await this.redisService.get<string>(
        `room:${roomId}`,
      );
      if (!roomDataString) {
        this.logger.log(`Room not found: ${roomId}`);
        client.emit('error', 'Room not found');
        return;
      }

      const roomData: RoomDataDto = JSON.parse(roomDataString);

      if (roomData.players.length >= 4) {
        this.logger.log(`Room ${roomId} is full`);
        client.emit('error', 'Room is full');
        return;
      }

      if (roomData.players.includes(playerNickname)) {
        this.logger.warn(`Nickname already taken: ${playerNickname}`);
        client.emit('error', 'Nickname already taken in this room');
        return;
      }

      roomData.players.push(playerNickname);
      await this.redisService.set(`room:${roomId}`, JSON.stringify(roomData));
      client.join(roomId);
      client.data = { roomId, nickname: playerNickname };

      this.logger.log(`User ${playerNickname} joined room ${roomId}`);
      this.server.to(roomId).emit('updateUsers', roomData.players);
    } catch (error) {
      this.logger.error(`Error joining room: ${error.message}`, error.stack);
      client.emit('error', 'Failed to join the room');
    }
  }

  @SubscribeMessage('disconnect')
  async handleDisconnect(@ConnectedSocket() client: Socket) {
    try {
      const { roomId, nickname } = client.data;
      const roomDataString = await this.redisService.get<string>(
        `room:${roomId}`,
      );

      if (!roomDataString) {
        this.logger.log(`Room not found: ${roomId}`);
        return;
      }

      const roomData: RoomDataDto = JSON.parse(roomDataString);

      roomData.players = roomData.players.filter(
        (player) => player !== nickname,
      );

      // todo
      // 이 상태에서 다른 사용자가 방에 들어온다면?

      if (roomData.hostNickname === nickname) {
        if (roomData.players.length > 0) {
          roomData.hostNickname = roomData.players[0];
          await this.redisService.set(
            `room:${roomId}`,
            JSON.stringify(roomData),
          );

          this.logger.log(`host ${nickname} leave room`);
          this.server
            .to(roomId)
            .emit('newHostAssigned', { newHostNickname: roomData.players[0] });
          this.logger.log(`host changed to ${roomData.players[0]}`);
          this.server.to(roomId).emit('updateUsers', roomData.players);
        } else {
          this.logger.log(`${roomId} deleting room`);
          await this.redisService.delete(`room:${roomId}`);
        }
      } else {
        await this.redisService.set(`room:${roomId}`, JSON.stringify(roomData));
        this.logger.log(`host ${nickname} leave room`);
        this.server.to(roomId).emit('updateUsers', roomData.players);
      }
    } catch (error) {
      this.logger.error('Error handling disconnect: ', error.message);
    }
  }
}
