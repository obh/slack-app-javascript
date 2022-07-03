import { Module } from '@nestjs/common';
import { APP_FILTER, APP_PIPE, RouterModule } from '@nestjs/core';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
import { SlackModule } from './slack/slack.module';

@Module({
  imports: [
    SlackModule,
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
