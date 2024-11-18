import { Module } from '@nestjs/common';
import { RedisModule } from '../../redis/redis.module';
import { GamesGateway } from './games.gateway';

@Module({
  imports: [RedisModule],
  providers: [GamesGateway],
  controllers: [],
})
export class GamesModule {}
