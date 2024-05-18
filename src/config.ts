interface Config {
    debug: boolean;
    send: boolean;
}

export default (debug = false, send = true): Config => ({ debug, send });
export { Config };