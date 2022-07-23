import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './slack/slack.exceptions';
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

  process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', reason || reason)
    //TODO: send the information to sentry.io    
  })
  
  app.use(bodyParser.urlencoded({verify: rawBodyBuffer, extended: true }));
  app.use(bodyParser.json({ verify: rawBodyBuffer }));
  app.useGlobalFilters(new AllExceptionsFilter)
  await app.listen(3000);
}


bootstrap();