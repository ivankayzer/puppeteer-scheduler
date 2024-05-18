import Redis from "./redis";
import Logger from './logger';
import Scheduler from "./scheduler";
import fs from "fs";
import Run from "./run";
import disrequire from "disrequire";
import Context from "./context";
import context from "./context";

const hasRuntimeFlag = (flag: string) => process.argv.includes(`--${flag}`);

(async () => {
    const scheduler = new Scheduler(hasRuntimeFlag('debug'));

    // Logger.debug(`Running ${JSON.stringify(script)}`);
    // try {
    //     this.running.push(path);
    //     await Run(script);
    // } catch (e) {
    //     this.running = this.running.filter((s) => s !== path);
    //     throw e;
    // }
    // Logger.debug("Finished running");
    // this.running = this.running.filter((s) => s !== path);
    // await this.redis.set(lastRunKey, nowInSeconds(), 3600 * 24 * 7);

    while (true) {
        const context = await Context.CreateForScheduler(scheduler, await Redis.getInstance())
            .Scan(`${__dirname}/../scripts/`)
            .Load();

        context.GetQueue().map(
            script => context.Run(script).then(context => context.SaveResult())
        );

        await new Promise((r) => setTimeout(r, 1000));
    }
})();

const gracefulShutdown = async (e: Error) => {
    Logger.error(e.message);
    if (hasRuntimeFlag("no-fail")) {
        return;
    }
    try {
        await (await Redis.getInstance()).closeConnection();
    } catch {
    }
    Logger.debug("graceful shutdown");
    process.exit(0);
};

process.on("SIGTERM", gracefulShutdown);
process.on("unhandledRejection", gracefulShutdown);
