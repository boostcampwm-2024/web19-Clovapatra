import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';
import { Redis } from 'ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import redisConfig from '../config/redis.config';

@Global()
@Module({
  imports: [ConfigModule.forRoot({ load: [redisConfig] })],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.get<string>('redis.host'),
          port: configService.get<number>('redis.port'),
          password: configService.get<string>('redis.password'),
        });
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule {}
