import dotenv from "dotenv";
import disrequire from "disrequire";
import Redis from "./redis";
import Logger from './logger';

import { printTable } from 'console-table-printer';

import run from "./run";

dotenv.config();

const nowInSeconds = () => Math.floor(Date.now() / 1000);

const redis = new Redis();
let files = [];

(async () => {
  const fs = require("fs");
  await redis.connect();

  const directoryPath = __dirname + "/../scripts";

  let running: string[] = [];

  const scan = async () => {
    return new Promise<void>((resolve) => {
      files = fs
        .readdirSync(directoryPath)
        .filter((file: string) => file.endsWith(".js"));

      Logger.debug(`Found ${files.length} tasks in directory ${directoryPath}`);
      printTable(files);

      files.forEach(async (file: string) => {
        const path = directoryPath + "/" + file;
        const script = require(path);

        if (!script.frequency) {
          Logger.warning(`${path} has an empty frequency field, skipping...`);
          return;
        }

        const lastRunKey = `lastRunAt:${path}`;

        const lastRunAt = await redis.get(lastRunKey);
        const isRunning = running.includes(path);

        if (isRunning) {
          return;
        }

        if (
          !lastRunAt ||
          nowInSeconds() > Number(lastRunAt) + script.frequency
        ) {
          Logger.debug(`Running ${JSON.stringify(script)}`);
          try {
            running.push(path);
            await run(script, process.argv.includes("--debug"));
          } catch (e) {
            running = running.filter((s) => s !== path);
            throw e;
          }
          Logger.debug("Finished running");
          running = running.filter((s) => s !== path);
          await redis.set(lastRunKey, nowInSeconds(), 3600 * 24 * 7);
        }

        disrequire(path);

        resolve();
      });
    });
  };

  while (true) {
    await scan();
    await new Promise((r) => setTimeout(r, 1000));
  }
})();

const gracefulShutdown = async (e: Error) => {
  Logger.error(e.message);
  if (process.argv.includes("--no-fail")) {
    return;
  }
  await redis.quit();
  Logger.debug("graceful shutdown");
  process.exit(0);
};

process.on("SIGTERM", gracefulShutdown);
process.on("unhandledRejection", gracefulShutdown);
