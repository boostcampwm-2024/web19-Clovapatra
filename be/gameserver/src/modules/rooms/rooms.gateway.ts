import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateRoomDto } from './dto/create-room.dto';
import { RedisService } from '../../redis/redis.service';
import { RoomDataDto } from './dto/room-data.dto';
import { v4 as uuidv4 } from 'uuid';

@WebSocketGateway({ namespace: '/rooms' })
export class RoomsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly redisService: RedisService) {}

  @SubscribeMessage('createRoom')
  async handleCreateRoom(
    @MessageBody() createRoomDto: CreateRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { roomName, creatorNickname } = createRoomDto;
    const roomId = uuidv4();
    const roomData: RoomDataDto = {
      roomId,
      roomName,
      creatorNickname,
      players: [creatorNickname],
      status: 'waiting',
    };

    await this.redisService.set(`room:${roomId}`, JSON.stringify(roomData));

    client.join(roomId);
    client.emit('roomCreated', roomData);
  }
}
