import puppeteer from "puppeteer";
import md5 from "md5";
import tg from "node-telegram-bot-api";
import Redis from "./redis";
import chats from "./scripts/helpers/chats";
import Browser from './browser';

const redis = new Redis();

const filterAsync = async function (array: Array<any>, callback: (v: any, i: number) => {}) {
  const results = await Promise.all(
    array.map((v, i) => callback(v, i))
  );
  return array.filter((_, i) => results[i]);
};

const run = async (
  { script, name, id, chatId, alertIf = () => {} }: any,
  debug = false,
  send = true
) => {
  const isArrayOfObjects = (result: any) =>
    Array.isArray(result) && result.length && typeof result[0] === "object";

  const isEmptyArray = (result: any) => Array.isArray(result) && !result.length;

  const saveResult = async (result: any, debug: boolean) => {
    const key = `history:${id}`;

    if (isEmptyArray(result)) {
      return null;
    }

    if (isArrayOfObjects(result)) {
      result = await filterAsync(result, async item => {
        const id = item.id ? item.id : JSON.stringify(item);
        
        if (debug) {
          return true;
        }

        const inSet = await redis.isInSet(key, md5(id));

        return !inSet;
      });

      console.log(result);

      if (!result.length) {
        return null;
      }

      result.forEach(async (item: any) => {
        if (debug) {
          return;
        }

        const id = item.id ? item.id : JSON.stringify(item);

        return await redis.pushToSet(key, md5(id), 3600 * 24 * 31);
      });

      return result;
    }

    if (!debug) {
      const md5OfResult = md5(JSON.stringify(result));
      const latest = await redis.getLatestFromList(key);
      if (latest && latest === md5OfResult) {
        return null;
      }
      await redis.pushToList(key, md5OfResult, 3600 * 24 * 31);
    }

    return result;
  };

// const browser = await Browser.browserless(puppeteer);
const browser = await Browser.macOSChrome(puppeteer);

  const page = await browser.newPage();
  let result = null;
  try {
    result = await script({ page });
  } catch (e) {
    await browser.close();
    throw e;
  }

  console.log("Finished with result:");
  console.log(JSON.stringify(result));

  try {
    await browser.close();
  } catch (e) {
    console.log(e);
  }

  try {
    if (alertIf(result)) {
      const statusBot = new tg(process.env.STATUS_BOT_TOKEN || "");
      await statusBot.sendMessage(
        chats.DEFAULT,
        `<b>${name}</b>` + "\nProblem occurred during script execution\n",
        {
          parse_mode: "HTML",
        }
      );
    }
  } catch (e) {
    console.log("failed reporting error");
  }

  try {
    result = await saveResult(result, debug);

    if (result !== null && !isEmptyArray(result) && send) {
      const bot = new tg(process.env.BOT_TOKEN || "");

      const messages = [];

      if (isArrayOfObjects(result)) {
        await result.map(async (pendingMessage: any) => {
          delete pendingMessage.id;
          messages.push(format(pendingMessage));
        });
      } else {
        messages.push(format(result));
      }

      for (let i = 0; i < messages.length; i++) {
        await bot.sendMessage(
          chatId,
          `<b>${name}</b>` + "\n" + messages[i] + "\n",
          {
            parse_mode: "HTML",
          }
        );

        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  } catch (e) {
    console.log(e);
  }
};

const format = (message: any) =>
  typeof message === "object" || Array.isArray(message)
    ? JSON.stringify(message, null, 2).replace(/[\[\]{}"]/g, "")
    : message;

export default run;
