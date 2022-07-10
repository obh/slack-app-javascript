import { Body, Controller, Get, Headers, Post, RawBodyRequest, Req, Res } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { BufferedIncomingMessage, HTTPModuleFunctions, isValidSlackRequest, SlashCommand } from '@slack/bolt';
import { SlackRequestVerificationOptions } from '@slack/bolt/dist/receivers/verify-request';
import { Request, Response } from 'express';
import { UnauthorizedError } from 'src/common/interceptors/exception.interceptor';
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
    private merchantService: MerchantService
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
  async handleCommand(@Headers() headers, @Req() req: RawBodyRequest<Request>) {
    const slackVerifOptions: SlackRequestVerificationOptions = {
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      body: req.rawBody.toString(),
      headers: {
        'x-slack-signature': headers['x-slack-signature'],
        'x-slack-request-timestamp': headers['x-slack-request-timestamp'],
      }
    }
    const isReqValid = isValidSlackRequest(slackVerifOptions);
    if(!isReqValid){
      throw new UnauthorizedError("Not authoriozed")
    }
    console.log("body is --> ", JSON.stringify(req.body))
    const slashCommand:SlashCommand = JSON.parse(JSON.stringify(req.body));
    const slackInstallation = await this.slackoauthService.getSlackInstallationForAppId(slashCommand.api_app_id)
    //TODO - throw error slack installation doesn't exist (should never happen)
    console.log("slash command --> ", slashCommand)
    await this.slackCmdService.handleCommand(slashCommand, slackInstallation)
    return "hello world! this is you"
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

}
