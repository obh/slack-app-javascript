
import { Injectable } from '@nestjs/common';
import { Merchant } from './interfaces/merchant.interface';

@Injectable()
export class MerchantService {
    async validateMerchant(token: string): Promise<Merchant> {
        return {
            merchantId: 17,
            token: "blah",
            isActive: true
        }
    }

}