import { createClient, RedisClientType } from "redis";

class Redis {
  private redis: RedisClientType;

  constructor() {
    this.redis = createClient({
      socket: {
        host: process.env.REDIS_HOST || "localhost",
      },
      password: process.env.REDIS_PASS,
    });

    this.redis.on("error", (error) => {
      console.error(`Redis error: ${error}`);
    });
  }

  pushToSet = async (key: string, value: string, ttl: number) => {
    await this.redis.sAdd(key, value);
    await this.redis.expire(key, ttl);
  };

  isInSet = async (key: string, member: string) => {
    return await this.redis.sIsMember(key, member);
  };

  pushToList = async (key: string, value: string, ttl: number) => {
    await this.redis.lPush(key, value);
    await this.redis.expire(key, ttl);
  };

  getLatestFromList = async (key: string) => {
    const value = await this.redis.lRange(key, 0, 0);
    return value[0];
  };

  set = async (key: string, value: string|number, ttl: number) => {
    await this.redis.set(key, value, { EX: ttl });
  };

  get = async (key: string) => {
    return await this.redis.get(key);
  };

  connect = async () => {
    return await this.redis.connect();
  };

  quit = async () => {
    return await this.redis.quit();
  };
}

export default Redis;
