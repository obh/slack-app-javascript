import { MiddlewareConsumer, Module,  NestModule } from '@nestjs/common';
import { MerchantService } from './merchant.service';


@Module({
    imports: [ ],
    controllers: [],
    providers: [MerchantService],
    exports: [MerchantService]
  })

  export class MerchantModule implements NestModule{
    configure(consumer: MiddlewareConsumer) {
        consumer.apply().forRoutes('/merchant')
    }

  }