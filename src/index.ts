import dotenv from "dotenv";
import disrequire from "disrequire";
import Redis from "./redis";

import run from "./run";

dotenv.config();

const nowInSeconds = () => Math.floor(Date.now() / 1000);

const redis = new Redis();
let files = [];

(async () => {
  const fs = require("fs");
  await redis.connect();

  const directoryPath = __dirname + "/scripts";

  let running: string[] = [];

  const scan = async () => {
    return new Promise<void>((resolve) => {
      files = fs
        .readdirSync(directoryPath)
        .filter((file: string) => file.endsWith(".js"));

      console.log(`Found ${files.length} files in directory ${directoryPath}`);
      console.log(files);

      files.forEach(async (file: string) => {
        const path = directoryPath + "/" + file;
        const script = require(path);

        if (!script.frequency) {
          console.warn(`${path} has an empty frequency field, skipping...`);
          return;
        }

        const lastRunKey = `lastRunAt:${script.id}`;

        const lastRunAt = await redis.get(lastRunKey);
        const isRunning = running.includes(script.id);

        if (isRunning) {
          return;
        }

        if (
          !lastRunAt ||
          nowInSeconds() > Number(lastRunAt) + script.frequency
        ) {
          console.log(`Running ${JSON.stringify(script)}`);
          try {
            running.push(script.id);
            await run(script, process.argv.includes("--debug"));
          } catch (e) {
            running = running.filter((s) => s !== script.id);
            throw e;
          }
          console.log("Finished running");
          running = running.filter((s) => s !== script.id);
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
  console.error(e);
  if (process.argv.includes("--no-fail")) {
    return;
  }
  await redis.quit();
  console.log("graceful shutdown");
  process.exit(0);
};

process.on("SIGTERM", gracefulShutdown);
process.on("unhandledRejection", gracefulShutdown);
