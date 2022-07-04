import { Body, Controller, Get, Headers, Post, Req, Res } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { HTTPModuleFunctions, SlashCommand } from '@slack/bolt';
import { SlackRequestVerificationOptions } from '@slack/bolt/dist/receivers/verify-request';
import { Request, Response } from 'express';
import { IncomingMessage} from 'http';
import { Merchant } from 'src/merchant/interfaces/merchant.interface';
import { MerchantService } from 'src/merchant/merchant.service';
import { SlackOAuthService } from './slack-oauth.service';

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
    const merchant: Merchant = this.merchantService.validateMerchant("random token");
    await this.slackoauthService.handleOauthRedirect(req, res)
    if(res.getHeader("update_id")){
      const idToUpdate:number = res.getHeader("update_id") as number
      await this.prismaClient.slackAppInstallation.update({
        where: {
          id: idToUpdate
        } , 
        data : {
          merchantId: merchant.merchantId
        }
      })
    }
    console.log("response to update -->", res.getHeader("update_id"))
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('Hello World!');
    res.end()
  }

  @Get("/install")
  async install(@Req() req: Request, @Res() res: Response){    
    const merchant = await this.merchantService.validateMerchant("random token");
    if(merchant.isActive){

    }
    this.slackoauthService.handleInstall(req, res)
  }
  
}
