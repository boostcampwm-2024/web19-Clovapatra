import { Module } from '@nestjs/common';
import { RedisModule } from 'src/redis/redis.module';
import { RoomsGateway } from './rooms.gateway';
import { RoomsWebSocketOnController } from './rooms.websocket.on.controller';
import { RoomsWebSocketEmitController } from './rooms.websocket.emit.controller';
import { RoomController } from './rooms.controller';

@Module({
  imports: [RedisModule],
  providers: [RoomsGateway],
  controllers: [
    RoomsWebSocketOnController,
    RoomsWebSocketEmitController,
    RoomController,
  ],
})
export class RoomsModule {}
