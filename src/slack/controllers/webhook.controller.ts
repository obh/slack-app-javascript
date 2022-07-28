import { Controller, Logger } from "@nestjs/common";
import { EventBus } from "@nestjs/cqrs";
import { MerchantService } from "src/merchant/merchant.service";
import { SlackCommandService } from "../services/slack-command.service";
import { SlackOAuthService } from "../services/slack-oauth.service";

@Controller("internal")
export class WebhookController {
  
  private readonly logger = new Logger(WebhookController.name);

  constructor(private slackoauthService: SlackOAuthService, 
    private slackCmdService: SlackCommandService, private merchantService: MerchantService, 
    private readonly eventBus: EventBus) {
    
    }


}