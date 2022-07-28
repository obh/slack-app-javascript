import { Controller, HttpCode, Logger, Post, Headers, Body } from "@nestjs/common";
import { EventBus } from "@nestjs/cqrs";
import { MerchantService } from "src/merchant/merchant.service";
import { APIAlertCommand } from "../commands/api-alert.command";
import { APIAlertDto } from "../dto/api-alert.dto";
import { WebhookDataEvent } from "../events/interface/webhook-data.event";
import { SlackPrismaService } from "../services/prisma.service";
import { SlackCommandService } from "../services/slack-command.service";
import { SlackOAuthService } from "../services/slack-oauth.service";
import { prepareSlashCommandForSubscription } from "../utils/slack.utils";

@Controller("internal")
export class WebhookController {
    
    private readonly logger = new Logger(WebhookController.name);
    
    constructor(private slackoauthService: SlackOAuthService, 
        private slackCmdService: SlackCommandService, 
        private merchantService: MerchantService, 
        private prismaService: SlackPrismaService,
        private readonly eventBus: EventBus) { }
        
        
        @Post("/api-alert")
        @HttpCode(200)
        async handleCommand(@Headers() headers, @Body() apiAlert: APIAlertDto) {
            if(!apiAlert.merchantId){
                throw new Error("merchantId not found")
            }
            const slackInstall = await this.prismaService.fetchActiveInstallationforMerchant(apiAlert.merchantId)
            const eventSubscription = await this.prismaService.fetchActiveSubscriptionForMerchant(apiAlert.merchantId, "api-alert")
            if(!slackInstall || !eventSubscription){
                throw new Error("slack installation or event subscription not found")
            }
            const apiAlertCmd = new APIAlertCommand(prepareSlashCommandForSubscription(eventSubscription), slackInstall);
            const webhookEvent = new WebhookDataEvent("api-alert", apiAlertCmd, WebhookController.getStaticData())
            this.eventBus.publish(webhookEvent)
            return {200: "success"}
        }

        static getStaticData(){
            return {
                id: 3967,
                uid: "194a68b1-e9ac-40af-8488-9982aeda0742",
                valid_card: "6011000990139424",
                token: "tok_jcb_123",
                invalid_card: "4000000000000010",
                month: "05",
                year: "2021",
                cvv: "123",
                cvv_amex: "1235",
            }
        }
    }