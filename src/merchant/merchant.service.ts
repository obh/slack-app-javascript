
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Merchant } from './interfaces/merchant.interface';
let axios = require('axios');

@Injectable()
export class MerchantService {

    private readonly logger = new Logger(MerchantService.name);

    constructor(private configService: ConfigService) {}

    public async validateMerchant(token: string): Promise<Merchant> {        
        if(this.configService.get("env") === "devo"){
            return {
                merchantId: 27,
                token: "",
                isActive: true
            }
        }
        const host = this.configService.get("merchantSvcHost")
        const url = host + "/merchant/v1/common/validate/token"
        const headers = {
            'authorization': 'Bearer ' + token,
        }        
        const res = await axios.get(url, headers, {timeout: 10000});
        this.logger.log("validateMerchant:: response ", res.data)
        if(res.status === 200 && res.data.status === "SUCCESS"){
            return {
                merchantId: res.data.merchantId,
                token: token,
                isActive: true
            }
        }
        //default to inactive merchant
        return {
                merchantId: 0,
                token: token,
                isActive: false
            }
    }

}