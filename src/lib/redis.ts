import { createClient, RedisClientType } from "redis";
import Logger from "./logger";
import { Script } from "../types/script";
import { IConfig } from "../config";

class Redis {
  private client: RedisClientType;
  private static instance: Redis;

  private constructor(config: IConfig) {
    this.client = createClient({
      socket: {
        host: config.redisHost,
      },
      password: config.redisPass,
    });

    this.client.on("error", (error) => {
      Logger.error(`Redis error: ${error}`);
    });
  }

  public async pushToSet(script: Script, value: string, ttl: number) {
    await this.client.sAdd(this.getHistoryKey(script), value);
    await this.client.expire(this.getHistoryKey(script), ttl);
  }

  public async isInSet(script: Script, member: string) {
    return await this.client.sIsMember(this.getHistoryKey(script), member);
  }

  public async pushToList(script: Script, value: string, ttl: number) {
    await this.client.lPush(this.getHistoryKey(script), value);
    await this.client.expire(this.getHistoryKey(script), ttl);
  }

  public async getLatestFromList(script: Script) {
    const value = await this.client.lRange(this.getHistoryKey(script), 0, 0);
    return value[0];
  }

  public async setLastRunAt(
    script: Script,
    value: string | number,
    ttl: number,
  ) {
    await this.client.set(this.getLastRunAtKey(script), value, { EX: ttl });
  }

  public async getLastRunAt(script: Script) {
    return await this.client.get(this.getLastRunAtKey(script));
  }

  public async connect() {
    return await this.client.connect();
  }

  public async closeConnection() {
    return await this.client.quit();
  }

  private getLastRunAtKey(script: Script) {
    return `lastRunAt:${script.name}`;
  }

  private getHistoryKey(script: Script) {
    return `history:${script.name}`;
  }

  public static async getInstance(config: IConfig) {
    if (!Redis.instance) {
      Redis.instance = new Redis(config);
      await Redis.instance.connect();
    }

    return Redis.instance;
  }
}

export default Redis;
