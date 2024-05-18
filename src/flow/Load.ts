import Logger from "../logger";
import disrequire from "disrequire";
import Redis from "../redis";

class Load {
    public static async from(scripts: string[]): Promise<any> {
        const loaded = [];

        const redis = await Redis.getInstance();
        const nowInSeconds = () => Math.floor(Date.now() / 1000);

        for (const path of scripts) {
            const script = require(path);

            if (!script.frequency) {
                Logger.warning(`${path} has an empty frequency field, skipping...`);
                continue;
            }

            const lastRunKey = `lastRunAt:${path}`;
            const lastRunAt = await redis.get(lastRunKey);

            if (
                !lastRunAt ||
                nowInSeconds() > Number(lastRunAt) + script.frequency
            ) {
                script.lastRunKey = lastRunKey;
                loaded.push(script);
            }

            disrequire(path);
        }

        return loaded;
    }
}

export default Load;