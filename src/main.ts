import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config'; 
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { AllExceptionsFilter } from './slack/slack.exceptions';
const bodyParser = require("body-parser");

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    bufferLogs: true,
  });

  const rawBodyBuffer = (req, res, buf, encoding) => {
    if (buf && buf.length) {
        req.rawBody = buf.toString(encoding || 'utf8');
    }
  };

  process.env.TZ = 'Asia/Kolkata' 
  const configService = app.get(ConfigService);  

  process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', reason || reason)
    //TODO: send the information to sentry.io    
  })
  process.on('uncaughtException', (err) => {
    console.log('Uncaught Exception thrown:', err)
  })
  
  app.use(bodyParser.urlencoded({verify: rawBodyBuffer, extended: true }));
  app.use(bodyParser.json({ verify: rawBodyBuffer }));
  app.useLogger(app.get(Logger));
  app.useGlobalFilters(new AllExceptionsFilter)
  await app.listen(configService.get("port"));
}


bootstrap();