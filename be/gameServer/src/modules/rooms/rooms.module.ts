import { Module } from '@nestjs/common';
import { RedisModule } from 'src/redis/redis.module';
import { RoomsGateway } from './rooms.gateway';
import { RoomsWebSocketController } from './rooms.websocket.controller';
import { RoomController } from './rooms.controller';

@Module({
  imports: [RedisModule],
  providers: [RoomsGateway],
  controllers: [RoomsWebSocketController, RoomController],
})
export class RoomsModule {}
