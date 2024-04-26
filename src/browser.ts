import { Puppeteer, PuppeteerNode } from "puppeteer";

class Browser {
  static browserless = async (puppeteer: Puppeteer) =>  await puppeteer.connect({
    browserWSEndpoint: process.env.BROWSERLESS_ENDPOINT,
  });

  static macOSChrome = async (puppeteer: PuppeteerNode) =>
    await puppeteer.launch({
      executablePath:
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      headless: false,
    });
}

export default Browser;