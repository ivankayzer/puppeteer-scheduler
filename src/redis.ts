import { createClient, RedisClientType } from "redis";
import Logger from './logger';

class Redis {
  private client: RedisClientType;
  private static instance: Redis;

  private constructor() {
    this.client = createClient({
      socket: {
        host: process.env.REDIS_HOST || "localhost",
      },
      password: process.env.REDIS_PASS,
    });

    this.client.on("error", (error) => {
      Logger.error(`Redis error: ${error}`);
    });
  }

  public async pushToSet(key: string, value: string, ttl: number) {
    await this.client.sAdd(key, value);
    await this.client.expire(key, ttl);
  };

  public async isInSet(key: string, member: string) {
    return await this.client.sIsMember(key, member);
  };

  public async pushToList(key: string, value: string, ttl: number) {
    await this.client.lPush(key, value);
    await this.client.expire(key, ttl);
  };

  public async getLatestFromList(key: string) {
    const value = await this.client.lRange(key, 0, 0);
    return value[0];
  };

  public async set(key: string, value: string|number, ttl: number) {
    await this.client.set(key, value, { EX: ttl });
  };

  public async get(key: string) {
    return await this.client.get(key);
  };

  public async connect() {
    return await this.client.connect();
  };

  public async closeConnection() {
    return await this.client.quit();
  };

  public static async getInstance() {
    if (!Redis.instance) {
      Redis.instance = new Redis();
      await Redis.instance.connect();
    }

    return Redis.instance;
  }
}

export default Redis;
