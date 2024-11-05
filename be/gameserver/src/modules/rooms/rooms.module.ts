import { Module } from '@nestjs/common';
import { RedisModule } from 'src/redis/redis.module';
import { RoomsGateway } from './rooms.gateway';

@Module({
  imports: [RedisModule],
  providers: [RoomsGateway],
})
export class RoomsModule {}
