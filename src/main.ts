import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
const bodyParser = require("body-parser");

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  const rawBodyBuffer = (req, res, buf, encoding) => {
    if (buf && buf.length) {
        req.rawBody = buf.toString(encoding || 'utf8');
    }
  };
  
  app.use(bodyParser.urlencoded({verify: rawBodyBuffer, extended: true }));
  app.use(bodyParser.json({ verify: rawBodyBuffer }));

  await app.listen(3000);
}
bootstrap();
