import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';
import { Logger } from '@nestjs/common';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private pubClient: Redis;
  private subClient: Redis;

  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {
    this.pubClient = new Redis(redisClient.options);
    this.subClient = new Redis(redisClient.options);
  }
  private readonly logger = new Logger(RedisService.name);

  async onModuleDestroy() {
    this.logger.log('Module is being destroyed, cleaning up room data...');

    const roomKeys = await this.redisClient.keys('room:*');

    for (const roomKey of roomKeys) {
      await this.redisClient.del(roomKey);
      this.logger.log(`Deleted Redis key: ${roomKey}`);
    }

    const roomNames = await this.redisClient.zrange('roomNames', 0, -1);
    for (const roomName of roomNames) {
      await this.redisClient.del(`roomNamesToIds:${roomName}`);
      this.logger.log(`roomNamesToIds:${roomName} deleted from Redis`);
    }

    await this.redisClient.del('roomNames');
    this.logger.log('roomNames sorted set deleted from Redis');

    await this.redisClient.del('roomsList');
    this.logger.log('roomsList deleted from Redis');

    const gameKeys = await this.redisClient.keys('game:*');
    for (const gameId of gameKeys) {
      await this.redisClient.del(gameId);
      this.logger.log(`Deleted Redis key: ${gameId}`);
    }

    this.logger.log('Room data cleaned and Redis clients disconnected');
  }

  async set<T>(
    key: string,
    value: T,
    channel?: string,
    ttlInSeconds?: number,
  ): Promise<void> {
    if (ttlInSeconds) {
      await this.redisClient.set(
        key,
        JSON.stringify(value),
        'EX',
        ttlInSeconds,
      );
    } else {
      await this.redisClient.set(key, JSON.stringify(value));
    }
    if (channel) {
      await this.publishToChannel(channel, `Updated: ${key}`);
    }
  }

  async hmset<T extends string | number | Buffer>(
    key: string,
    fields: Record<string, T>,
    channel?: string,
    updatePage?: number,
  ): Promise<void> {
    const fieldsArray = Object.entries(fields).flat();
    await this.redisClient.hmset(key, ...fieldsArray);

    if (channel) {
      await this.publishToChannel(
        channel,
        JSON.stringify({
          ...(updatePage !== undefined ? { updatePage } : {}),
        }),
      );
    }
  }

  async hget<T>(key: string, field: string): Promise<T | null> {
    const value = await this.redisClient.hget(key, field);
    return value ? JSON.parse(value) : null;
  }

  async hgetAll<T>(key: string): Promise<T | null> {
    const values = await this.redisClient.hgetall(key);

    if (Object.keys(values).length === 0) {
      return null;
    }

    const parsedValues: T = {} as T;
    for (const [field, value] of Object.entries(values)) {
      if (field === 'players') {
        parsedValues[field] = JSON.parse(value);
      } else {
        parsedValues[field] = value;
      }
    }

    return parsedValues;
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redisClient.get(key);
    return value ? JSON.parse(value) : null;
  }

  async delete(key: string, channel?: string): Promise<void> {
    await this.redisClient.del(key);
    if (channel) {
      await this.publishToChannel(channel, JSON.stringify({}));
    }
  }

  async publishToChannel(channel: string, message: string): Promise<void> {
    await this.pubClient.publish(channel, message);
  }

  async keys(pattern: string): Promise<string[]> {
    return this.redisClient.keys(pattern);
  }

  async flushAll(): Promise<void> {
    await this.redisClient.flushall();
  }

  async rpush(key: string, value: string): Promise<void> {
    await this.redisClient.rpush(key, value);
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    const values: string[] = await this.redisClient.lrange(key, start, stop);
    return values;
  }

  async lrem(key: string, value: string, count: number = 1): Promise<void> {
    await this.redisClient.lrem(key, count, value);
  }

  async llen(key: string): Promise<number> {
    return await this.redisClient.llen(key);
  }

  async zadd(keyPrefix: string, score: number, value: string): Promise<void> {
    const key = `${keyPrefix}`;
    await this.redisClient.zadd(key, score, value);
  }

  async zrangebylex(
    keyPrefix: string,
    min: string,
    max: string,
  ): Promise<string[]> {
    const key = `${keyPrefix}`;
    const values: string[] = await this.redisClient.zrangebylex(key, min, max);
    return values;
  }

  async zrem(key: string, ...members: string[]): Promise<number> {
    return await this.redisClient.zrem(key, ...members);
  }

  subscribeToChannel(
    channel: string,
    callback: (message: string) => void,
  ): void {
    this.subClient.subscribe(channel);

    this.subClient.on('message', (subscribedChannel, message) => {
      if (subscribedChannel === channel) {
        callback(message);
      }
    });
  }
}
