// @ts-nocheck

import { Page } from "puppeteer";
import Helpers from "./config/helpers";

const script = async (page: Page, helpers: Helpers, args = []) => {
  console.log(args);
};

module.exports = {
  script: script,
  frequency: 1,
  args: [
    {
      name: "url",
      type: "string"
    }
  ]
};