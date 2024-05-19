interface IConfig {
  debug: boolean;
  send: boolean;
  noFail: boolean;
  browser: "macChrome" | "browserless";
  statusBotTelegramToken?: string;
  botTelegramToken?: string;
  redisHost?: string;
  redisPass?: string;
  browserlessEndpoint?: string;
}

class Config {
  public static create(): IConfig {
    return <IConfig>{
      debug: this.hasRuntimeFlag("debug"),
      send: !this.hasRuntimeFlag("no-send"),
      noFail: this.hasRuntimeFlag("no-fail"),
      browser: this.getRuntimeFlag("browser") || "browserless",
      statusBotTelegramToken:
        this.getRuntimeFlag("statusBotTelegramToken") ||
        process.env.STATUS_BOT_TOKEN,
      botTelegramToken:
        this.getRuntimeFlag("botTelegramToken") || process.env.BOT_TOKEN,
      redisHost:
        this.getRuntimeFlag("redisHost") ||
        process.env.REDIS_HOST ||
        "localhost",
      redisPass: this.getRuntimeFlag("redisPass") || process.env.REDIS_PASS,
      browserlessEndpoint:
        this.getRuntimeFlag("browserlessEndpoint") ||
        process.env.BROWSERLESS_ENDPOINT,
    };
  }

  private static hasRuntimeFlag = (flag: string) =>
    process.argv.includes(`--${flag}`);
  private static getRuntimeFlag = (flag: string) =>
    process.argv
      .find((f) => f.startsWith(`--${flag}=`))
      ?.substring(`--${flag}=`.length);
}

export default Config;
export { IConfig };
