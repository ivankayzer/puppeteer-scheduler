import Redis from "./lib/redis";
import Logger from "./lib/logger";
import Config from "./config";
import Run from "./actions/Run";
import Load from "./actions/Load";
import SaveResult from "./actions/SaveResult";
import SendResult from "./actions/SendResult";

const config = Config.create();

(async () => {
  while (true) {
    for (const script of await Load.from(`${__dirname}/../scripts/`, config)) {
      Run.from(script, config)
        .then((result) => SaveResult.from(script, result, config))
        .then((result) => SendResult.from(script, result, config));
    }

    await new Promise((r) => setTimeout(r, 1000));
  }
})();

const gracefulShutdown = async (e: Error) => {
  Logger.error(e.message);

  if (config.noFail) {
    return;
  }

  try {
    await (await Redis.getInstance(config)).closeConnection();
  } catch {}

  Logger.debug("graceful shutdown");
  process.exit(0);
};

process.on("SIGTERM", gracefulShutdown);
process.on("unhandledRejection", gracefulShutdown);
