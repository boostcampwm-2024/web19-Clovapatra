import { Module } from '@nestjs/common';
import { RedisModule } from '../../redis/redis.module';
import { GamesWebSocketEmitController } from './games.websocket.emit.controller';
import { GamesWebSocketOnController } from './games.websocket.on.controller';
import { GamesGateway } from './games.gateway';

@Module({
  imports: [RedisModule],
  providers: [GamesGateway],
  controllers: [GamesWebSocketEmitController, GamesWebSocketOnController],
})
export class GamesModule {}
