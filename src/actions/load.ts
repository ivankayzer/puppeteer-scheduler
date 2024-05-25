import Logger from "../lib/logger";
import disrequire from "disrequire";
import Redis from "../lib/redis";
import { Script } from "../types/script";
import { nowInSeconds } from "../lib/helpers";
import fs from "fs";
import { IConfig } from "../config";

class Load {
  public static async from(path: string, config: IConfig): Promise<Script[]> {

    const files = fs
      .readdirSync(path)
      .filter((file: string) => file.endsWith(".js"));

    Logger.debug(`Found ${files.length} tasks in directory ${path}`);
    console.table(files);

    const scripts = files.map((file) => `${path}/${file}`);

    const loaded = [];

    for (const path of scripts) {
      const script = require(path);

      if (config.isScheduler()) {
        if (!script.frequency) {
          Logger.warning(`${path} has an empty frequency field, skipping...`);
          continue;
        }
  
        const redis = await Redis.getInstance(config);
        const lastRunAt = await redis.getLastRunAt(script);
  
        if (!lastRunAt || nowInSeconds() > Number(lastRunAt) + script.frequency) {
          loaded.push(script);
        }
      }
      
      if (config.isServer()) {
        loaded.push(script);
      }

      disrequire(path);
    }

    return loaded;
  }
}

export default Load;
