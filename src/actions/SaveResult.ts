import md5 from "md5";
import Logger from "../lib/logger";
import Redis from "../lib/redis";
import { IConfig } from "../config";
import { Script } from "../types/script";
import {
  filterAsync,
  isArrayOfObjects,
  isEmptyArray,
  nowInSeconds,
} from "../lib/helpers";
import Result from "../types/result";

class SaveResult {
  public static async from(
    script: Script,
    result: typeof Result,
    config: IConfig,
  ): Promise<typeof Result> {
    const redis = await Redis.getInstance(config);

    await redis.setLastRunAt(script, nowInSeconds(), 3600 * 24 * 7);

    if (isEmptyArray(result)) {
      return;
    }

    if (isArrayOfObjects(result)) {
      result = await filterAsync(result, async (item) => {
        const id = item.id ? item.id : JSON.stringify(item);

        if (config.debug) {
          return true;
        }

        const inSet = await redis.isInSet(script, md5(id));

        return !inSet;
      });

      Logger.debug(result);

      if (!result.length) {
        return null;
      }

      for (const item of result) {
        if (config.debug) {
          continue;
        }

        const id = item.id ? item.id : JSON.stringify(item);

        await redis.pushToSet(script, md5(id), 3600 * 24 * 31);
      }

      return result;
    }

    if (!config.debug) {
      const md5OfResult = md5(JSON.stringify(result));
      const latest = await redis.getLatestFromList(script);
      if (latest && latest === md5OfResult) {
        return null;
      }
      await redis.pushToList(script, md5OfResult, 3600 * 24 * 31);
    }

    return result;
  }
}

export default SaveResult;
