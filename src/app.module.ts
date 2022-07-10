import { Module,  } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { MerchantModule } from './merchant/merchant.module';
import { SlackModule } from './slack/slack.module';

@Module({
  imports: [
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
