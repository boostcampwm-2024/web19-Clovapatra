import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { RedisService } from '../../redis/redis.service';
import { RoomDataDto } from './dto/room-data.dto';
import { v4 as uuidv4 } from 'uuid';

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
    const { roomName, creatorNickname } = createRoomDto;
    this.logger.log(
      `Room creation requested: ${roomName} by ${creatorNickname}`,
    );

    const roomId = uuidv4();
    const roomData: RoomDataDto = {
      roomId,
      roomName,
      creatorNickname,
      players: [creatorNickname],
      status: 'waiting',
    };

    try {
      await this.redisService.set(`room:${roomId}`, JSON.stringify(roomData));
      this.logger.log(`Room created successfully: ${roomId}`);

      client.join(roomId);
      client.emit('roomCreated', roomData);
    } catch (error) {
      this.logger.error(`Error creating room: ${error.message}`, error.stack);
      throw error;
    }
  }
}
