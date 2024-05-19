import Redis from "./lib/redis";
import Logger from "./lib/logger";
import Config from "./config";
import Run from "./actions/run";
import Load from "./actions/load";
import Save from "./actions/save";
import Send from "./actions/send";

const config = Config.create();

(async () => {
  while (true) {
    for (const script of await Load.from(config.scriptPath, config)) {
      await Run.from(script, config)
        .then((result) => Save.from(script, result, config))
        .then((result) => Send.from(script, result, config));
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
