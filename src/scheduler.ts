import fs from "fs";
import Logger from "./logger";
import Run from "./run";
import disrequire from "disrequire";
import Redis from "./redis";

class Scheduler {
    files: string[] = [];
    running: string[] = [];
    debug: boolean;

    constructor(debug: boolean) {
        this.debug = debug;
    }

    async getRedis () {
        return Redis.getInstance();
    }

    private getScriptPath(script?: string) {
        return `${__dirname}/../scripts/${script || ''}`;
    }

    private nowInSeconds() {
        return Math.floor(Date.now() / 1000)
    }

    public async scan() {
        const redis = await this.getRedis();

        return new Promise<void>((resolve) => {
            this.files = fs
                .readdirSync(this.getScriptPath())
                .filter((file: string) => file.endsWith(".js"));

            Logger.debug(`Found ${this.files.length} tasks in directory ${this.getScriptPath()}`);
            console.table(this.files);

            this.files.forEach(async (file: string) => {
                const path = this.getScriptPath(file);
                const script = require(path);

                if (!script.frequency) {
                    Logger.warning(`${path} has an empty frequency field, skipping...`);
                    return;
                }

                const lastRunKey = `lastRunAt:${path}`;

                const lastRunAt = await redis.get(lastRunKey);
                const isRunning = this.running.includes(path);

                if (isRunning) {
                    return;
                }

                if (
                    !lastRunAt ||
                    this.nowInSeconds() > Number(lastRunAt) + script.frequency
                ) {
                    Logger.debug(`Running ${JSON.stringify(script)}`);
                    try {
                        this.running.push(path);
                        await Run(script, this.debug);
                    } catch (e) {
                        this.running = this.running.filter((s) => s !== path);
                        throw e;
                    }
                    Logger.debug("Finished running");
                    this.running = this.running.filter((s) => s !== path);
                    await redis.set(lastRunKey, this.nowInSeconds(), 3600 * 24 * 7);
                }

                disrequire(path);

                resolve();
            });
        });
    };


}

export default Scheduler;