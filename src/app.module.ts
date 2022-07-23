import { Module,  } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { MerchantModule } from './merchant/merchant.module';
import { SlackModule } from './slack/slack.module';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    LoggerModule.forRoot(),
    SlackModule,
    MerchantModule,
    RouterModule.register([
      {
        path: 'slack',
        module: SlackModule,
      },
    ])
  ],
  controllers: [],
  providers: [],
})

export class AppModule {}
