import { Body, Controller, Get, Headers, Post, Req, Res } from '@nestjs/common';
import { HTTPModuleFunctions, SlashCommand } from '@slack/bolt';
import { SlackRequestVerificationOptions } from '@slack/bolt/dist/receivers/verify-request';
import { Request, Response } from 'express';
import { IncomingMessage} from 'http';
import { SlackOAuthService } from './slack-oauth.service';

@Controller()
export class SlackController {
  
  constructor(private slackoauthService: SlackOAuthService) { }

  @Get("/thanks")
  getHello(): string {
    return "hello world"
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

  @Get("/install")
  install(@Req() req: Request, @Res() res: Response){
    this.slackoauthService.handleInstall(req, res)
  }

  
}
