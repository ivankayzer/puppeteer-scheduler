import Browser from "./browser";
import puppeteer from "puppeteer";
import Helpers from "../scripts/config/helpers";
import Logger from "./logger";
import Scheduler from "./scheduler";
import fs from "fs";
import Redis from "./redis";
import Run from "./run";
import disrequire from "disrequire";

class Context {
    private result: any;
    private files: string[] = [];
    private running: string[] = [];
    private queue: any[] = [];
    private redis: Redis;

    constructor(redis: Redis) {
        this.redis = redis;
    }

    public static CreateForHttp(redis: Redis) {
        return new this(
            redis
        );
    }

    public static CreateForScheduler(scheduler: Scheduler, redis: Redis) {
        return new this(
            redis
        );
    }

    public async Run({
                         script, name, id, chatId, alertIf = () => {
        }
                     }: any) {
        // const browser = await Browser.browserless(puppeteer);
        const browser = await Browser.macOSChrome(puppeteer);

        const page = await browser.newPage();
        try {
            this.result = await script(page, Helpers);
        } catch (e) {
            await browser.close();
            throw e;
        }

        Logger.debug("Finished with result:");
        console.table(this.result);

        try {
            await browser.close();
        } catch (e: any) {
            Logger.error(e);
        }

        return this;
    }

    public ReturnResult() {
        return this.result;
    }

    public Scan(path: string) {
        const files = fs.readdirSync(path)
            .filter((file: string) => file.endsWith(".js"));

        Logger.debug(`Found ${this.files.length} tasks in directory ${path}`);
        console.table(this.files);

        this.files = files.map(file => `${path}/${file}`);

        return this;
    }

    public async Load() {
        const nowInSeconds = () => Math.floor(Date.now() / 1000);

        for (const path of this.files) {
            const script = require(path);

            if (!script.frequency) {
                Logger.warning(`${path} has an empty frequency field, skipping...`);
                continue;
            }

            const lastRunKey = `lastRunAt:${path}`;

            const lastRunAt = await this.redis.get(lastRunKey);
            const isRunning = this.running.includes(path);

            if (isRunning) {
                continue;
            }

            if (
                !lastRunAt ||
                nowInSeconds() > Number(lastRunAt) + script.frequency
            ) {
                this.queue.push(script);
            }

            disrequire(path);
        }

        return this;
    }

    public GetQueue() {
        return this.queue;
    }
}

export default Context;