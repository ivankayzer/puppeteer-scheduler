// @ts-nocheck

import { Page } from "puppeteer";
import Helpers from "./config/helpers";

const script = async (page: Page, helpers: Helpers) => {
  await page.goto("https://coinmarketcap.com/currencies/toncoin/");
  await helpers.setViewport(page);
  await helpers.wait(5000);
  return await page.evaluate(
    () =>
      document
        .querySelector("#section-coin-overview [data-role=el]:nth-child(2)")
        .innerText.split("\\n")[0],
  );
};

module.exports = {
  script: script,
  name: "test",
  frequency: 1,
};
