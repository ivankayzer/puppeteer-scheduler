import Redis from "./redis";
import Logger from './logger';
import Config from "./config";
import Scan from "./flow/Scan";
import Run from "./flow/Run";
import Load from "./flow/Load";
import SaveResult from "./flow/SaveResult";
import SendResult from "./flow/SendResult";

const hasRuntimeFlag = (flag: string) => process.argv.includes(`--${flag}`);

(async () => {
    const config = Config(hasRuntimeFlag('debug'));


    while (true) {
        const files = Scan.from(`${__dirname}/../scripts/`);
        const scripts = await Load.from(files);

        for (const script of scripts) {
            const result = await Run.from(script);
            const savedResult = await SaveResult.from(script, result, config);
            await SendResult.from(script, savedResult, config);
        }

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
