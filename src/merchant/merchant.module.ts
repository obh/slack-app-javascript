import { MiddlewareConsumer, Module, NestMiddleware, NestModule } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { MerchantService } from './merchant.service';


@Module({
    imports: [ ],
    controllers: [],
    providers: [PrismaService],
    exports: [MerchantService]
  })

  export class MerchantModule implements NestModule{
    configure(consumer: MiddlewareConsumer) {
        consumer.apply().forRoutes('/merchant')
    }

  }