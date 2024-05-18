import fs from "fs";
import Logger from "./logger";
import Run from "./run";
import disrequire from "disrequire";
import Redis from "./redis";

class Scheduler {
    files: string[] = [];
    running: string[] = [];
    debug: boolean;

    constructor(debug: boolean) {
        this.debug = debug;
    }

    async getRedis () {
        return Redis.getInstance();
    }

    private nowInSeconds() {
        return Math.floor(Date.now() / 1000)
    }

    public async scan() {

    };


}

export default Scheduler;