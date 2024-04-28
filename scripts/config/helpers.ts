import { Page } from "puppeteer";

class Helpers {
  static EMPTY_PAGE = 'about:blank';

  static setViewport = async (page: Page) => {
    await page.setViewport({ width: 1920, height: 1080 });
  };
  
  static screenshot = async (page: Page, name?: string) => {
    await page.screenshot({ path: name ? `${name}.png` : "screenshot.png" });
  };
  
  static wait = async (milliseconds: number) => {
    await new Promise((r) => setTimeout(r, milliseconds));
  };
  
  static setUserAgent = async (page: Page, userAgent: string) => {
    await page.setUserAgent(userAgent);
  }
  
  static getPageCookies = async (page: Page) => {
    return JSON.stringify(await page.cookies(), null, 2);
  };
  
  static loadPageCookies = async (page: Page, cookies: string) => {
    if (!cookies) {
      return;
    }
    await page.setCookie(...JSON.parse(cookies));
  };
}


export default Helpers;
