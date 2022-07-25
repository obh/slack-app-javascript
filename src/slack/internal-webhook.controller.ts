import { Body, Controller, Post, Res } from "@nestjs/common";
import { Logger } from '@nestjs/common';
import { EventBus } from "@nestjs/cqrs";
import { PrismaClient } from "@prisma/client";
import { MerchantService } from "src/merchant/merchant.service";
import { SlackCommandService } from "./services/slack-command.service";
import { SlackOAuthService } from "./services/slack-oauth.service";


@Controller()
export class InternalWebhookController {
    
    private readonly logger = new Logger(InternalWebhookController.name);
    private prismaClient: PrismaClient
    
    constructor(private slackoauthService: SlackOAuthService, 
        private slackCmdService: SlackCommandService, private merchantService: MerchantService, 
        private readonly eventBus: EventBus) {

        this.prismaClient = new PrismaClient({
            log: [
                {
                    emit: 'stdout',
                    level: 'query',
                },
            ],
        })
    }

    // @Post("/api-alert")
    // async apiAlertWebhook(@Body() body: Request, @Res() res: Response) {
    //     this.logger.log("body is --> ", JSON.stringify(body))
    //     const event = await this.slackCmdService.handleApiAlert(body)
    //     if(event){
    //         this.eventBus.publish(event)
    //     }
    //     res.send("ok")
    // }
    
    // }
}
