import Logger from "../lib/logger";
import tg from "node-telegram-bot-api";
import { IConfig } from "../config";
import { isArrayOfObjects, isEmptyArray } from "../lib/helpers";
import { Script } from "../types/script";
import Result from "../types/result";

const format = (message: any) =>
  typeof message === "object" || Array.isArray(message)
    ? JSON.stringify(message, null, 2).replace(/[\[\]{}"]/g, "")
    : message;

class Send {
  public static async from(
    { name, alertIf }: Script,
    result: typeof Result,
    config: IConfig,
  ): Promise<void> {
    try {
      if (alertIf && alertIf(result) && config.chatId) {
        const statusBot = new tg(config.statusBotTelegramToken || "");
        await statusBot.sendMessage(
          config.chatId,
          `<b>${name}</b>` + "\nProblem occurred during script execution\n",
          {
            parse_mode: "HTML",
          },
        );
      }
    } catch (e) {
      Logger.error("failed reporting error");
    }

    try {
      if (result !== null && !isEmptyArray(result) && config.chatId) {
        const bot = new tg(config.botTelegramToken || "");

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
            config.chatId,
            `<b>${name}</b>` + "\n" + messages[i] + "\n",
            {
              parse_mode: "HTML",
            },
          );

          await new Promise((r) => setTimeout(r, 1000));
        }
      }
    } catch (e: any) {
      Logger.error(e);
    }
  }
}

export default Send;
