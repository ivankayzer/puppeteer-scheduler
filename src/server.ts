import express, {Request, Response} from "express";
import bodyParser from "body-parser";
import yaml, { load } from "js-yaml";

import Run from "./actions/run";
import Config from "./config";
import Load from "./actions/load";
import logger from "./lib/logger";
import { Script } from "./types/script";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.text({ type: "application/yaml" }));
app.use((req, res, next) => {
  if (req.is("application/yaml")) {
    try {
      req.body = yaml.load(req.body);
    } catch (err) {
      return res.status(400).send({ error: "Invalid YAML format" });
    }
  }
  next();
});

app.post("/run-once", async (req: Request, res: Response) => {
  const script: Script = {
    name: req.body.name || "one-time",
    script: new Function(
      `return async function run(page, helpers) { ${req.body.script} }`,
    )(),
  };

  res.send({ result: await Run.from(script, Config.createForServer(), req.body.args || []) });
});

app.post("/run/:name", async (req: Request, res: Response) => {
  const config = Config.createForServer();

  const loaded = (await Load.from(config.scriptPath, config)).find(script => script.name === req.params.name);
  
  if (!loaded) {
    logger.warning(`No script found with name: ${req.params.name}.js`);
    return res.sendStatus(404);
  }

  const script: Script = {
    name: loaded.name,
    script: loaded.script,
  };

  res.send({ result: await Run.from(script, config, req.body.args || []) });
});

app.get("/scripts", async (req: Request, res: Response) => {
  const config = Config.createForServer();
  const loaded = await Load.from(config.scriptPath, config);

  res.send(loaded.map(({name, frequency, args})=> ({ name, frequency, args })));
});

app.listen(80);
