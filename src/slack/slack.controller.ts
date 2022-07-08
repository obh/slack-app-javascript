import { Body, Controller, Get, Headers, Post, Req, Res } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { HTTPModuleFunctions, SlashCommand } from '@slack/bolt';
import { Request, Response } from 'express';
import { IncomingMessage} from 'http';
import { UnauthorizedError } from 'src/common/interceptors/exception.interceptor';
import { Merchant } from 'src/merchant/interfaces/merchant.interface';
import { MerchantService } from 'src/merchant/merchant.service';
import { SlackOAuthService } from './slack-oauth.service';
import { SlackInstallationStatus } from './utils/slack.utils';

@Controller()
export class SlackController {
  
  private prismaClient: PrismaClient

  constructor(
    private slackoauthService: SlackOAuthService,
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
  handleCommand(@Headers() headers, @Body() request: IncomingMessage): string {

    console.log("headers --> ", headers)
    console.log("command --> ", request)
    const isValidRequest = HTTPModuleFunctions.parseAndVerifyHTTPRequest({
      enabled: true,
      signingSecret: process.env.SLACK_SIGNING_SECRET!,
    }, request)
    console.log("is valid request --> ", isValidRequest)
    return "hello world!"
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
      this.prismaClient.slackAppInstallation.update({
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
