interface IConfig {
  debug: boolean;
  chatId?: string;
  scriptPath: string;
  noFail: boolean;
  browser: "macOSChrome" | "browserless" | "windowsChrome";
  statusBotTelegramToken?: string;
  botTelegramToken?: string;
  redisHost?: string;
  redisPass?: string;
  browserlessEndpoint?: string;

  isServer(): boolean;
  isScheduler(): boolean;
}

class Config {
  public static createForServer = (): IConfig => Config.create("server");
  public static createForScheduler = (): IConfig => Config.create("scheduler");

  private static create(mode: "server" | "scheduler"): IConfig {
    return <IConfig>{
      isScheduler: () => mode === "scheduler",
      isServer: () => mode === "server",
      debug: this.hasRuntimeFlag("debug"),
      chatId: this.getRuntimeFlag("chatId") || process.env.CHAT_ID,
      noFail: this.hasRuntimeFlag("noFail"),
      scriptPath: this.getRuntimeFlag("scriptPath") || process.env.SCRIPT_PATH || `${process.cwd()}/dist/scripts/`,
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
