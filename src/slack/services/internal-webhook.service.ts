import { Inject, Injectable } from "@nestjs/common";
import { SlackPrismaService } from "./prisma.service";

@Injectable()
export class InternalWebhookService {

    @Inject(SlackPrismaService)
    private readonly slackPrismaSvc: SlackPrismaService;
    
    constructor(){}

    /**
     * This is where we will prepare the API alert body and use it to publish the event.
     * @param body any body
     * @returns 
     */
    async handleAPIAlert(body: any): Promise<any> {
        const merchantId = Number(body.merchantId)
        if(merchantId && merchantId > 0){
            throw new Error("merchantId is required for API alert webhook")
        }
        const slackInstallation = this.slackPrismaSvc.fetchActiveInstallationforMerchant(merchantId)
        const eventSubscription = this.slackPrismaSvc.fetchActiveSubscriptionForMerchant(merchantId, "api-alert")
        if(!slackInstallation || !eventSubscription){
            throw new Error("No active installation or subscription found for this merchant")
        }
        //const event = this.slackCommandSvc.prepareApiAlertEvent(body, slackInstallation, eventSubscription)
        
    }
}