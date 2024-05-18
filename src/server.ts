import express from 'express'
import bodyParser from 'body-parser'
import yaml from 'js-yaml';

import Run from './flow/Run';

const app = express()

app.use(bodyParser.json());
app.use(bodyParser.text({type: 'application/yaml'}));
app.use((req, res, next) => {
    if (req.is('application/yaml')) {
        try {
            req.body = yaml.load(req.body);
        } catch (err) {
            return res.status(400).send({error: 'Invalid YAML format'});
        }
    }
    next();
});

app.post('/run-once', async (req, res) => {
    const script = {script: new Function(`return async function run(page, helpers) { ${req.body.script} }`)()};
    const result = await Run.from(script);
    res.send({result});
});

app.listen(80);