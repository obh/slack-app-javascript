import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MerchantModule } from 'src/merchant/merchant.module';
import { PrismaService } from 'src/prisma.service';
import { CommandHandlers } from './commands/handlers';
import { EventHandlers } from './events';
import { MyCqrsModule } from './my-cqrs.module';
import { EventHandlerSaga } from './sagas/event.sagas';
import { SlackCommandService } from './services/slack-command.service';
import { SlackOAuthService } from './services/slack-oauth.service';
import { SlackController } from './slack.controller';

@Module({
    imports: [MerchantModule, MyCqrsModule],
    controllers: [SlackController],
    providers: [
      SlackOAuthService, 
      SlackCommandService, 
      PrismaService,
      ...CommandHandlers,
      ...EventHandlers,
      EventHandlerSaga,
    ],
  })

  export class SlackModule implements NestModule{
    configure(consumer: MiddlewareConsumer) {
        consumer.apply().forRoutes('/slack')
    }

  }