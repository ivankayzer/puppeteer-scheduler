import md5 from "md5";
import Logger from "../logger";
import tg from "node-telegram-bot-api";
import chats from "../../scripts/config/chats";
import {Config} from "../config";

class SendResult {
    public static async from({name, chatId, alertIf = () => {}}: any, result: any, config: Config): Promise<void> {

        const isArrayOfObjects = (result: any) =>
            Array.isArray(result) && result.length && typeof result[0] === "object";

        const isEmptyArray = (result: any) => Array.isArray(result) && !result.length;

        const format = (message: any) =>
            typeof message === "object" || Array.isArray(message)
                ? JSON.stringify(message, null, 2).replace(/[\[\]{}"]/g, "")
                : message;

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
            Logger.error("failed reporting error");
        }

        try {

            if (result !== null && !isEmptyArray(result) && config.send) {
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
        } catch (e: any) {
            Logger.error(e);
        }
    }
}

export default SendResult;