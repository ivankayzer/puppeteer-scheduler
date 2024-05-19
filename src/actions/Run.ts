import Logger from "../lib/logger";
import Browser from "../lib/browser";
import puppeteer from "puppeteer";
import Helpers from "../../scripts/config/helpers";
import { Script } from "../types/script";
import Result from "../types/result";
import { IConfig } from "../config";

class Run {
  public static async from(
    { script, name }: Script,
    config: IConfig,
  ): Promise<typeof Result> {
    Logger.debug(`Running ${JSON.stringify(name)}`);

    const browser = await Browser.fromConfig(config, puppeteer);
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
