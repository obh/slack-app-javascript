
import { Injectable } from '@nestjs/common';
import { Merchant } from './interfaces/merchant.interface';

@Injectable()
export class MerchantService {
    public validateMerchant(token: string): Merchant {
        //curl https://merchant.cashfree.com/api/merchant/v1/common/validate/token
        return {
            merchantId: 17,
            token: "blah",
            isActive: true
        }
    }

}