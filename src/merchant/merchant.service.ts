
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Merchant } from './interfaces/merchant.interface';

@Injectable()
export class MerchantService {

    constructor(private configService: ConfigService) {}

    public validateMerchant(token: string): Merchant {
        //curl https://merchant.cashfree.com/api/merchant/v1/common/validate/token
        console.log("environment is --> ", this.configService.get("env"))
        if(this.configService.get("env") === "devo"){
            return {
                merchantId: 27,
                token: "blah",
                isActive: true
            }
        }
    }

}