import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisService } from '../../redis/redis.service';
import { Logger } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomDataDto } from './dto/room-data.dto';
import { JoinRoomDto } from './dto/join-data.dto';
import { v4 as uuidv4 } from 'uuid';

// todo: pipe or fillter 사용하여 예외상황처리

@WebSocketGateway({ namespace: '/rooms' })
export class RoomsGateway {
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
      this.logger.log(`Room created successfully: ${roomId}`);

      client.join(roomId);
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
      this.logger.log(`User ${playerNickname} joined room ${roomId}`);

      this.server.to(roomId).emit('updateUsers', roomData.players);
    } catch (error) {
      this.logger.error(`Error joining room: ${error.message}`, error.stack);
      client.emit('error', 'Failed to join the room');
    }
  }
}
