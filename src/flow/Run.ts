import Logger from "../logger";
import Browser from "../browser";
import puppeteer from "puppeteer";
import Helpers from "../../scripts/config/helpers";

class Run {
    public static async from({script, name, lastRunKey}: any): Promise<any> {
        // const browser = await Browser.browserless(puppeteer);
        const browser = await Browser.macOSChrome(puppeteer);

        Logger.debug(`Running ${JSON.stringify(name)}`);
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

        return result;
    }
}

export default Run;