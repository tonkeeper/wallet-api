import { engine } from 'express-handlebars';
import express from 'express';
import path from 'path';
import cors from 'cors';
import { getLocalIPAddress, makeTxInlineDeepLink, makeTxJsonDeepLink } from './utils';
import { bodyExtractors } from './TxBodyData';

function init() {
  const protocol = 'https';
  const port = 8080;
  const host = getLocalIPAddress();
  const hostname = `${host}:${port}`;
  const app = express();
  
  app.use(cors());
  app.engine("handlebars", engine());
  app.set("view engine", "handlebars");
  app.set("views", path.resolve(__dirname, "./views"));

  app.get('/:type.json', (req, res) => {
    const expiresSec = 0;
    const responseOptions = {
      callback_url: `${protocol}://${hostname}/complete`,
      return_url: `${protocol}://${hostname}/complete`,
      broadcast: true
    };

    if (req.params.type) {
      const bodyExtractor = bodyExtractors[req.params.type];
      if (bodyExtractor) {
        const body = bodyExtractor(responseOptions, expiresSec);

        return res.json({
          version: "0",
          body,
        });
      }
    }

    res.json({ error: true });
  });

  app.get('/', (req, res) => {
    const expiresSec = 0;
    const responseOptions = {
      callback_url: `${protocol}://${hostname}/complete`,
      return_url: `${protocol}://${hostname}/complete`,
      broadcast: true
    };

    const deepLinks = Object.keys(bodyExtractors).map((type) => {
      const extractor = bodyExtractors[type];
      const body = extractor(responseOptions, expiresSec);

      return {
        type,
        inlineLink: makeTxInlineDeepLink(body),
        jsonLink: makeTxJsonDeepLink(`${hostname}/${type}.json`)
      }
    });
 
    res.render('home', { 
      layout: false,
      deepLinks
    });
  });

  app.listen(port, host, () => {
    console.log(`Server running at ${protocol}://${hostname}/`);
  });
}

init();