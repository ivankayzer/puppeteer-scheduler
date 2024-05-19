import express from "express";
import bodyParser from "body-parser";
import yaml from "js-yaml";

import Run from "./actions/Run";
import Config from "./config";
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

app.post("/run-once", async (req, res) => {
  const script: Script = {
    name: req.body.name || "one-time",
    script: new Function(
      `return async function run(page, helpers) { ${req.body.script} }`,
    )(),
  };

  res.send({ result: await Run.from(script, Config.create()) });
});

app.listen(80);
