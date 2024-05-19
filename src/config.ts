interface IConfig {
  debug: boolean;
  chatId?: string;
  noFail: boolean;
  browser: "localChrome" | "browserless";
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
      chatId: this.getRuntimeFlag("chatId") || process.env.CHAT_ID,
      noFail: this.hasRuntimeFlag("noFail"),
      browser: this.getRuntimeFlag("browser") || "browserless",
      statusBotTelegramToken:
        this.getRuntimeFlag("telegramStatusBotToken") ||
        process.env.STATUS_BOT_TOKEN,
      botTelegramToken:
        this.getRuntimeFlag("telegramBotToken") || process.env.BOT_TOKEN,
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
