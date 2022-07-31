import { Controller, Get, Headers, HttpCode, Post, RawBodyRequest, Req, Res, UseInterceptors } from '@nestjs/common';
import { isValidSlackRequest, SlashCommand } from '@slack/bolt';
import { SlackRequestVerificationOptions } from '@slack/bolt/dist/receivers/verify-request';
import { Request, Response } from 'express';
import { EventBus } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ErrorInterceptor, UnauthorizedError } from 'src/common/interceptors/exception.interceptor';
import { Merchant } from 'src/merchant/interfaces/merchant.interface';
import { MerchantService } from 'src/merchant/merchant.service';
import { SlackCommandService } from '../services/slack-command.service';
import { SlackOAuthService } from '../services/slack-oauth.service';
import { SlackPrismaService } from '../services/prisma.service';


@Controller("user")
export class SlackController {
  
  private readonly logger = new Logger(SlackController.name);

  constructor(
    private slackoauthService: SlackOAuthService,
    private slackCmdService: SlackCommandService,
    private merchantService: MerchantService,
    private prismaSvc: SlackPrismaService,
    private readonly eventBus: EventBus,
    ) { }

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
  @UseInterceptors(ErrorInterceptor)
  async handleCommand(@Headers() headers, @Req() req: RawBodyRequest<Request>) {
    // const slackVerifOptions = this.constructSlackVerificatonReq(req.rawBody.toString(), headers)
    // const isReqValid = isValidSlackRequest(slackVerifOptions);
    // if(!isReqValid){
    //   throw new UnauthorizedError("Not authorized")
    // }
    const slashCommand:SlashCommand = JSON.parse(JSON.stringify(req.body));
    const slackInstallation = await this.prismaSvc.fetchActiveInstallation(slashCommand.api_app_id)
    //TODO - throw error slack installation doesn't exist (should never happen)
    this.logger.log("handleCommand:: Command ", slashCommand)
    const [event, resp] = await this.slackCmdService.handleCommand(slashCommand)
    if(event){
      event.command.slackInstallation = slackInstallation
      event.command.slashCommand = slashCommand
      this.logger.log("handleCommand::sending event", event)
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
    const activeInstallation = await this.prismaSvc.fetchActiveInstallationforMerchant(merchant.merchantId)    
    await this.slackoauthService.handleOauthRedirect(req, res)    
    // if(activeInstallation) {
    //   this.prismaSvc.disableInstallation(activeInstallation.id)
    // }
  }

  @Get("/install")
  async install(@Req() req: Request, @Res() res: Response){        
    const merchant = await this.merchantService.validateMerchant(req.headers.authorization);
    if(!merchant.isActive){
      throw new UnauthorizedError("Not authorized")
    }
    this.slackoauthService.handleInstall(req, res)
  }

  @Post("/events")
  @HttpCode(200)
  async handleEvents(@Headers() headers, @Req() req: RawBodyRequest<Request>, @Res() res: Response) {
    const slackVerifOptions = this.constructSlackVerificatonReq(req.rawBody.toString(), headers)
    const isReqValid = isValidSlackRequest(slackVerifOptions);
    if(!isReqValid){ 
      throw new UnauthorizedError("Not authorized")
    }
    //handle challenge
    if(req.body.challenge){
      this.logger.log("handling slack challenge request for events")
      return res.json({"challenge": req.body.challenge})
    }
    if(!req.body.event) {
      throw new UnauthorizedError("Cannot find event body")
    }
    const eventType = req.body.event.type || req.body.type;
    let response;
    this.logger.log("handleEvents:: ", eventType, req.body)
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
    return "ok"
  }
}
