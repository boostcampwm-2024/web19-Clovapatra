const Redis = require('ioredis');
const config = require('../config/redis.config');

class RedisService {
  constructor() {
    this.client = new Redis({
      host: config.host,
      port: config.port,
      password: config.password
    });
  }

  async getRoomData(roomId) {
    try {
      const data = await this.client.get(`${config.keyPrefix}${roomId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      throw error;
    }
  }

  async updateRoomData(roomId, roomData) {
    try {
      await this.client.set(
        `${config.keyPrefix}${roomId}`,
        JSON.stringify(roomData)
      );
    } catch (error) {
      console.error('Redis set error:', error);
      throw error;
    }
  }
}

module.exports = new RedisService();