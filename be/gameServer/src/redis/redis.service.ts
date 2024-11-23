import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private pubClient: Redis;
  private subClient: Redis;

  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {
    this.pubClient = new Redis(redisClient.options);
    this.subClient = new Redis(redisClient.options);
  }

  onModuleDestroy() {
    this.pubClient.quit();
    this.subClient.quit();
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

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redisClient.get(key);
    return value ? JSON.parse(value) : null;
  }

  async delete(key: string, channel?: string): Promise<void> {
    await this.redisClient.del(key);
    if (channel) {
      await this.publishToChannel(channel, `Deleted: ${key}`);
    }
  }

  async keys(pattern: string): Promise<string[]> {
    return this.redisClient.keys(pattern);
  }

  async publishToChannel(channel: string, message: string): Promise<void> {
    await this.pubClient.publish(channel, message);
  }

  async flushAll(): Promise<void> {
    await this.redisClient.flushall();
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
