import { Inject, Injectable } from "@nestjs/common";
import { PrismaClient, Prisma } from "@prisma/client";
import { SlackInstallationStatus } from "../utils/slack.utils";
import { SlackCommandService } from "./slack-command.service";

@Injectable()
export class InternalWebhookService {

    private prismaClient: PrismaClient;
    @Inject(SlackCommandService)
    private readonly slackCommandSvc: SlackCommandService;
    
    constructor(){
        this.prismaClient = new PrismaClient({
            log: [
                {
                    emit: 'stdout',
                    level: 'query',
                },
            ],
        });
    }

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
        const slackInstallation = this.slackCommandSvc.fetchActiveInstallationforMerchant(merchantId)
        const eventSubscription = this.slackCommandSvc.fetchActiveSubscriptionForMerchant(merchantId, "api-alert")
        if(!slackInstallation || !eventSubscription){
            throw new Error("No active installation or subscription found for this merchant")
        }
        //const event = this.slackCommandSvc.prepareApiAlertEvent(body, slackInstallation, eventSubscription)
        
    }
}