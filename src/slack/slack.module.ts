import { MiddlewareConsumer, Module, NestMiddleware, NestModule } from '@nestjs/common';
import { PrismaService } from 'prisma.service';
import { SlackOAuthService } from './slack-oauth.service';
import { SlackController } from './slack.controller';

@Module({
    imports: [ ],
    controllers: [SlackController],
    providers: [SlackOAuthService, PrismaService],
  })
  
  export class SlackModule implements NestModule{
    configure(consumer: MiddlewareConsumer) {
        consumer.apply().forRoutes('/slack')
    }

  }