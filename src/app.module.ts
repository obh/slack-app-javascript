import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { MerchantModule } from './merchant/merchant.module';
import { SlackModule } from './slack/slack.module';
import { LoggerModule } from 'nestjs-pino';
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';


@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration]
    }),
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
