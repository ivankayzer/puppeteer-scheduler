import { Script } from "../types/script";
import { IRedis } from "./redis";

class RedisFake implements IRedis {
  public async pushToSet(script: Script, value: string, ttl: number) {}

  public async isInSet(script: Script, member: string) {
    return true;
  }

  public async pushToList(script: Script, value: string, ttl: number) {}

  public async getLatestFromList(script: Script) {
    return null;
  }

  public async setLastRunAt(script: Script, value: number, ttl: number) {}

  public async getLastRunAt(script: Script) {
    return null;
  }

  public async connect() {}

  public async closeConnection() {}
}

export default RedisFake;
