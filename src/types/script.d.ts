import Result from "./result";
import { Page } from "puppeteer";
import Helpers from "../../scripts/config/helpers";

interface Script {
  script: (page: Page, helpers: Helpers, args: (boolean | number | string)[] = []) => Result;
  name: string;
  frequency?: number;
  alertIf?: (result: Result) => boolean;
  args?: Argument[]
}

interface Argument {
  name: string;
  type: "string" | "number" | "boolean"
}

export { Script };
