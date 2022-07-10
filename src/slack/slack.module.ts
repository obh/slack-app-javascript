import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MerchantModule } from 'src/merchant/merchant.module';
import { PrismaService } from 'src/prisma.service';
import { SlackCommandService } from './services/slack-command.service';
import { SlackOAuthService } from './services/slack-oauth.service';
import { SlackController } from './slack.controller';

@Module({
    imports: [MerchantModule],
    controllers: [SlackController],
    providers: [SlackOAuthService, SlackCommandService, PrismaService],
  })

  export class SlackModule implements NestModule{
    configure(consumer: MiddlewareConsumer) {
        consumer.apply().forRoutes('/slack')
    }

  }