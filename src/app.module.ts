import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { APP_FILTER, APP_PIPE, RouterModule } from '@nestjs/core';
import { JsonBodyMiddleware } from './common/middleware/json-body.middleware';
import { RawBodyMiddleware } from './common/middleware/raw-body.middleware';
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
// export class AppModule implements NestModule {
//   public configure(consumer: MiddlewareConsumer): void {
//       consumer
//           .apply(RawBodyMiddleware)
//           .forRoutes({
//               path: '/slack/command',
//               method: RequestMethod.POST,
//           })
//           .apply(JsonBodyMiddleware)
//           .forRoutes('*');
//   }
// }

