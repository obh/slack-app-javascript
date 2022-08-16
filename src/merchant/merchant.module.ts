import { MiddlewareConsumer, Module,  NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MerchantService } from './merchant.service';


@Module({
    imports: [ ConfigModule ],
    controllers: [],
    providers: [MerchantService],
    exports: [MerchantService]
  })

  export class MerchantModule implements NestModule{
    configure(consumer: MiddlewareConsumer) {
        consumer.apply().forRoutes('/merchant')
    }

  }