import { Module,  } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { MerchantModule } from './merchant/merchant.module';
import { SlackModule } from './slack/slack.module';
import { LoggerModule } from 'nestjs-pino';
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path';


@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
      serveRoot: '/slack/user/static'   
    }),
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
