import md5 from "md5";
import Logger from "../logger";
import Redis from "../redis";

class SaveResult {
    public static async from({id}: any, result: any, config: any): Promise<any> {
        const key = `history:${id}`;
        const redis = await Redis.getInstance();
        const isArrayOfObjects = (result: any) => Array.isArray(result) && result.length && typeof result[0] === "object";
        const isEmptyArray = (result: any) => Array.isArray(result) && !result.length;

        const filterAsync = async function (
            array: Array<any>,
            callback: (v: any, i: number) => {}
        ) {
            const results = await Promise.all(array.map((v, i) => callback(v, i)));
            return array.filter((_, i) => results[i]);
        };

        if (isEmptyArray(result)) {
            return;
        }

        if (isArrayOfObjects(result)) {
            result = await filterAsync(result, async (item) => {
                const id = item.id ? item.id : JSON.stringify(item);

                if (config.debug) {
                    return true;
                }

                const inSet = await redis.isInSet(key, md5(id));

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

                await redis.pushToSet(key, md5(id), 3600 * 24 * 31);
            }

            return result;
        }

        if (!config.debug) {
            const md5OfResult = md5(JSON.stringify(result));
            const latest = await redis.getLatestFromList(key);
            if (latest && latest === md5OfResult) {
                return null;
            }
            await redis.pushToList(key, md5OfResult, 3600 * 24 * 31);
        }

        return result;

    }
}

export default SaveResult;