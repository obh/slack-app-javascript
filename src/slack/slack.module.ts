import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MerchantModule } from 'src/merchant/merchant.module';
import { PrismaService } from 'src/prisma.service';
import { CommandHandlers } from './commands/handlers';
import { EventHandlers } from './events';
import { EventHandlerSaga } from './sagas/event.sagas';
import { SlackPrismaService } from './services/prisma.service';
import { SlackCommandService } from './services/slack-command.service';
import { SlackOAuthService } from './services/slack-oauth.service';
import { TestRepository } from './services/test.repository';
import { SlackController } from './controllers/slack.controller';

@Module({
    imports: [MerchantModule, CqrsModule],
    controllers: [SlackController],
    providers: [
      TestRepository,
      SlackOAuthService, 
      SlackCommandService, 
      SlackPrismaService,
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