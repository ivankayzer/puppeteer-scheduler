import Redis from "./redis";
import Logger from './logger';
import Scheduler from "./scheduler";

const hasRuntimeFlag = (flag: string) => process.argv.includes(`--${flag}`);

(async () => {
    const scheduler = new Scheduler(hasRuntimeFlag('debug'));

    while (true) {
        await scheduler.scan();
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
    } catch {}
    Logger.debug("graceful shutdown");
    process.exit(0);
};

process.on("SIGTERM", gracefulShutdown);
process.on("unhandledRejection", gracefulShutdown);
