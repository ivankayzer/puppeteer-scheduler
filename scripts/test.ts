import { Page } from "puppeteer";

import Helpers from "./config/helpers";
import chats from "./config/chats";
import Frequency from "./config/frequency"

const script = async (page: Page, helpers: Helpers) => {
    await page.goto('https://coinmarketcap.com/currencies/toncoin/');
    // @ts-ignore
    await helpers.setViewport(page);
    // @ts-ignore
    await helpers.wait(5000);
    // @ts-ignore
    return await page.evaluate(() => document.querySelector('#section-coin-overview [data-role=el]:nth-child(2)').innerText.split('\\n')[0]);
};

module.exports = {
  script: script,
  name: "test",
  chatId: chats.DEFAULT,
  frequency: 1,
};
