import { Controller, Get, Headers, HttpCode, Post, RawBodyRequest, Req, Res, UseFilters, UseInterceptors } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { isValidSlackRequest, SlashCommand } from '@slack/bolt';
import { SlackRequestVerificationOptions } from '@slack/bolt/dist/receivers/verify-request';
import { Request, Response } from 'express';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { NotFoundInterceptor, UnauthorizedError } from 'src/common/interceptors/exception.interceptor';
import { Merchant } from 'src/merchant/interfaces/merchant.interface';
import { MerchantService } from 'src/merchant/merchant.service';
import { SlackCommandService } from './services/slack-command.service';
import { SlackOAuthService } from './services/slack-oauth.service';
import { SlackInstallationStatus } from './utils/slack.utils';

@Controller()
export class SlackController {
  
  private prismaClient: PrismaClient

  constructor(
    private slackoauthService: SlackOAuthService,
    private slackCmdService: SlackCommandService,
    private merchantService: MerchantService,
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,
    ) { 
      this.prismaClient = new PrismaClient({
        log: [
            {
                emit: 'stdout',
                level: 'query',
            },
        ],
      })
      // console.log("prisma client --> ", this.prismaClient)
  }

  @Get("/thanks")
  getHello(): string {
    return "hello world"
  }

  @Get("/end")
  getEnd(): string {
    return "this is the end!"
  }

  @Post("/command")
  @HttpCode(200)
  @UseInterceptors(NotFoundInterceptor)
  async handleCommand(@Headers() headers, @Req() req: RawBodyRequest<Request>) {
    const slackVerifOptions = this.constructSlackVerificatonReq(req.rawBody.toString(), headers)
    const isReqValid = isValidSlackRequest(slackVerifOptions);
    if(!isReqValid){
      throw new UnauthorizedError("Not authorized")
    }
    console.log("body is --> ", JSON.stringify(req.body))
    const slashCommand:SlashCommand = JSON.parse(JSON.stringify(req.body));
    const slackInstallation = await this.slackoauthService.getSlackInstallationForAppId(slashCommand.api_app_id)
    //TODO - throw error slack installation doesn't exist (should never happen)
    console.log("slash command --> ", slashCommand)
    const [event, resp] = await this.slackCmdService.handleCommand(slashCommand)
    if(event){
      this.eventBus.publish(event)
    }
    return resp
  }

  @Get("/oauth_redirect")
  async oauthRedirect(@Req() req: Request, @Res() res: Response) {    
    const merchantToken = this.extractCookieValue(req, "token")
    const merchant: Merchant = this.merchantService.validateMerchant(merchantToken); 
    if(!merchant.isActive){
      throw new UnauthorizedError("Not authorized")
    }   
    res.setHeader("merchantId", merchant.merchantId)
    const activeInstallation = await this.slackoauthService.getSlackInstallationForMerchant(merchant.merchantId)    
    await this.slackoauthService.handleOauthRedirect(req, res)    
    if(activeInstallation) {
      this.prismaClient.slackInstallation.update({
        where: {
          id: activeInstallation.id,
        },
        data: {
          installationStatus: SlackInstallationStatus.DEACTIVATED,
        }
     })
    }
  }

  @Get("/install")
  async install(@Req() req: Request, @Res() res: Response){        
    const merchant = await this.merchantService.validateMerchant(req.headers.authorization);
    if(!merchant.isActive){
      throw new UnauthorizedError("Not authorized")
    }
    //const activeInstallation = this.slackoauthService.getSlackInstallationForMerchant(merchant.merchantId)    
    this.slackoauthService.handleInstall(req, res)
  }

  @Post("/events")
  async handleEvents(@Headers() headers, @Req() req: RawBodyRequest<Request>, @Res() res: Response) {
    const slackVerifOptions = this.constructSlackVerificatonReq(req.rawBody.toString(), headers)
    const isReqValid = isValidSlackRequest(slackVerifOptions);
    console.log("is valid --> ", isReqValid)
    console.log(req.body)
    const retObj = {
      "blocks": [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": ":wave: Welcome to Cashfree Slack App!"
          }
        },
        {
          "type": "divider"
        },
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": ":white_check_mark: You can now subscribe to events"
          }
        },
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": ":white_check_mark: You can also get important data right on Slack!"
          }
        }
      ]
    }
    this.slackoauthService.requestHandler("A03M59CUFU3", "D03M59RE1CK")
  }

  private extractCookieValue(req, name) {
    const allCookies = req.headers.cookie;
    if (allCookies) {
      const found = allCookies.split(';').find((c) => c.trim().startsWith(`${name}=`));
      if (found) {
        return found.split('=')[1].trim();
      }
    }
    return undefined;
  }

  private constructSlackVerificatonReq(body: string, @Headers() headers): SlackRequestVerificationOptions {
    const slackVerifOptions: SlackRequestVerificationOptions = {
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      body: body,
      headers: {
        'x-slack-signature': headers['x-slack-signature'],
        'x-slack-request-timestamp': headers['x-slack-request-timestamp'],
      }
    }
    return slackVerifOptions
  }

  @Get("/event")
  async startEvent(){
    //await this.eventBus.publish(new APIErrorEvent(17, {}))
    // const apiAlertCmd = AllCommands.filter( c => c.eventId == 'api-alert');
    // console.log(apiAlertCmd); 
    //const commandResp = await this.commandBus.execute(new APIAlertCommand(17, {}))
    //return commandResp.data

    // find slack installation for merchantId and do any other validation (which is common)
    // CommandUtilService(fetch installation for merchantId)
    // command.validate(slackInstallation)
    // event.send(commandValidated(command, slackInstallation))
    return "ok"
  }
}
