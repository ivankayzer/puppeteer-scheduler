import fs from "fs";
import Logger from "../logger";

class Scan {
    public static from(path: string) {
        const files = fs.readdirSync(path)
            .filter((file: string) => file.endsWith(".js"));

        Logger.debug(`Found ${files.length} tasks in directory ${path}`);
        console.table(files);

        return files.map(file => `${path}/${file}`);
    }
}

export default Scan;