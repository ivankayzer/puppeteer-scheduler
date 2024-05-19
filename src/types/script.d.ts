import Result from "./result";
import { Page } from "puppeteer";
import Helpers from "../../scripts/config/helpers";

interface Script {
  script: (page: Page, helpers: Helpers) => Result;
  name: string;
  frequency?: number;
  alertIf?: (result: Result) => boolean;
}

export { Script };
