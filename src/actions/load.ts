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
      .filter((file: string) => file.endsWith(".script.js"));

    Logger.debug(`Found ${files.length} scripts in directory ${path}`);
    console.table(files.map(file => file.replace('.script.js', '')));

    const loaded: Script[] = [];

    for (const file of files) {
      const filePath = `${path}/${file}`;

      const script = require(filePath);
      script.name = file.replace('.script.js', '');

      if (config.isScheduler()) {
        if (!script.frequency) {
          Logger.warning(`${filePath} has an empty frequency field, skipping...`);
          continue;
        }
  
        const redis = await Redis.getInstance(config);
        const lastRunAt = await redis.getLastRunAt(script);
  
        if (!lastRunAt || nowInSeconds() > (lastRunAt + script.frequency)) {
          loaded.push(script);
        }
      }
      
      if (config.isServer()) {
        loaded.push(script);
      }

      disrequire(filePath);
    }

    return loaded;
  }
}

export default Load;
