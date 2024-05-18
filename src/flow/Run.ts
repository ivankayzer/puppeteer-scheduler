import fs from "fs";
import Logger from "../logger";
import disrequire from "disrequire";
import Browser from "../browser";
import puppeteer from "puppeteer";
import Helpers from "../../scripts/config/helpers";
import Redis from "../redis";

class Run {
    public static async from({
                                 script, name, id, chatId, lastRunKey, alertIf = () => {
        }
                             }: any): Promise<any> {
        const nowInSeconds = () => Math.floor(Date.now() / 1000);

        const redis = await Redis.getInstance();

        // const browser = await Browser.browserless(puppeteer);
        const browser = await Browser.macOSChrome(puppeteer);

        Logger.debug(`Running ${JSON.stringify(script)}`);
        const page = await browser.newPage();
        let result = null;
        try {
            result = await script(page, Helpers);
        } catch (e) {
            await browser.close();
            throw e;
        }

        Logger.debug("Finished with result:");
        console.table(result);

        try {
            await browser.close();
        } catch (e: any) {
            Logger.error(e);
        }

        Logger.debug("Finished running");

        await redis.set(lastRunKey, nowInSeconds(), 3600 * 24 * 7);

        return result;
    }
}

export default Run;