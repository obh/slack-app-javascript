import { Controller, Get, Headers, HttpCode, Post, RawBodyRequest, Req, Res, UseInterceptors } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { isValidSlackRequest, SlashCommand } from '@slack/bolt';
import { SlackRequestVerificationOptions } from '@slack/bolt/dist/receivers/verify-request';
import { Request, Response } from 'express';
import { EventBus } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { NotFoundInterceptor, UnauthorizedError } from 'src/common/interceptors/exception.interceptor';
import { Merchant } from 'src/merchant/interfaces/merchant.interface';
import { MerchantService } from 'src/merchant/merchant.service';
import { SlackCommandService } from './services/slack-command.service';
import { SlackOAuthService } from './services/slack-oauth.service';
import { SlackInstallationStatus } from './utils/slack.utils';

@Controller()
export class SlackController {
  
  private readonly logger = new Logger(SlackController.name);
  private prismaClient: PrismaClient

  constructor(
    private slackoauthService: SlackOAuthService,
    private slackCmdService: SlackCommandService,
    private merchantService: MerchantService,
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
    // const slackVerifOptions = this.constructSlackVerificatonReq(req.rawBody.toString(), headers)
    // const isReqValid = isValidSlackRequest(slackVerifOptions);
    // if(!isReqValid){
    //   throw new UnauthorizedError("Not authorized")
    // }
    this.logger.log("body is --> ", JSON.stringify(req.body))
    const slashCommand:SlashCommand = JSON.parse(JSON.stringify(req.body));
    const slackInstallation = await this.slackoauthService.getSlackInstallationForAppId(slashCommand.api_app_id)
    //TODO - throw error slack installation doesn't exist (should never happen)
    this.logger.log("slash command --> ", slashCommand)
    const [event, resp] = await this.slackCmdService.handleCommand(slashCommand)
    if(event){
      event.setSlackInstall(slackInstallation);
      event.setSlashCommand(slashCommand);
      this.eventBus.publish(event);
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
  @HttpCode(200)
  async handleEvents(@Headers() headers, @Req() req: RawBodyRequest<Request>, @Res() res: Response) {
    const slackVerifOptions = this.constructSlackVerificatonReq(req.rawBody.toString(), headers)
    const isReqValid = isValidSlackRequest(slackVerifOptions);
    this.logger.log("is valid --> ", isReqValid)
    if(!isReqValid){ 
      throw new UnauthorizedError("Not authorized")
    }
    //handle challenge
    if(req.body.challenge){
      this.logger.log("handling challenge request for events")
      return res.json({"challenge": req.body.challenge})
    }
    if(!req.body.event) {
      throw new UnauthorizedError("Cannot find event body")
    }
    const eventType = req.body.event.type || req.body.type;
    let response;
    this.logger.log("event type is -> ", eventType)
    switch(eventType){
      case "app_uninstalled":
        response = this.slackoauthService.handleUninstall(req.body.api_app_id);
        break;
      case "app_home_opened":
        response = this.slackoauthService.handleAppHomeOpen(req.body.api_app_id, req.body.event.channel);
        break;
      default:
        break;
    }
    return response;
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
  async startEvent(@Req() req){
    const x = req.helx;
    console.log("yolanda --> ", req.body.api_app_id);
    this.slackoauthService.handleUninstall("req.body.api_app_id");
    return "ok"
  }
}
