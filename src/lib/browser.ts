import { Puppeteer, PuppeteerNode } from "puppeteer";
import { IConfig } from "../config";

class Browser {
  private static browserless = async (config: IConfig, puppeteer: Puppeteer) =>
    await puppeteer.connect({
      browserWSEndpoint: config.browserlessEndpoint,
    });

  private static macOSChrome = async (
    config: IConfig,
    puppeteer: PuppeteerNode,
  ) =>
    await puppeteer.launch({
      executablePath:
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      headless: false,
    });

  static fromConfig = async (config: IConfig, puppeteer: PuppeteerNode) => {
    switch (config.browser) {
      case "localChrome":
        return await this.macOSChrome(config, puppeteer);
      case "browserless":
        return await this.browserless(config, puppeteer);
    }
  };
}

export default Browser;
