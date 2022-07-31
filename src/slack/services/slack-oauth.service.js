import { Injectable, Inject, Logger } from '@nestjs/common';
import { AppRunner } from '@seratch_/bolt-http-runner';
import { App, LogLevel } from '@slack/bolt';
import { PrismaInstallationStore } from "slack-bolt-prisma";
import { PrismaClient } from '@prisma/client';
import { PostHomeViewToSlack, PostToSlack, SlackInstallationStatus } from '../utils/slack.utils';
import { homeTemplate } from '../templates/slack-home.template';
import { SlackPrismaService } from './prisma.service';
const { WebClient, LogLevel } = require("@slack/web-api");

const scopes = ['channels:read', 'chat:write', 'commands', 'chat:write.customize']

/*
 * This is a javascript file because TS throws a compile error when I try to add custom object to installation object
 */

@Injectable()
export class SlackOAuthService {

    appRunner;
    app;
    prismaClient;
    @Inject(SlackPrismaService)
    slackPrismaSvc;

    logger = new Logger(SlackOAuthService.name);

    constructor(){
        this.prismaClient = new PrismaClient({});
        
        const installationStore = new PrismaInstallationStore({    
            prismaTable: this.prismaClient.slackInstallation,
            historicalDataEnabled: false,
            clientId: process.env.SLACK_CLIENT_ID,
            onStoreInstallation: async ({ prismaInput, installation, idToUpdate }) => {
                this.logger.log("OnStoreInstallation::", prismaInput, installation, idToUpdate)
                prismaInput.merchantId = installation.merchantId
                prismaInput.installationStatus = installation.installationStatus                
            },
        });
        
        const runner = new AppRunner({
            logLevel: LogLevel.DEBUG,
            stateSecret: process.env.SLACK_STATE_SECRET,
            signingSecret: process.env.SLACK_SIGNING_SECRET,
            clientId: process.env.SLACK_CLIENT_ID,
            clientSecret: process.env.SLACK_CLIENT_SECRET,
            scopes: scopes, 
            installationStore: installationStore,          
            installerOptions: {
                directInstall: true,
                installPathOptions: {
                    // Before redirection we add our own cookie to the request. 
                    // This cookie is used to track the installation. 
                    beforeRedirection: async(req, res, options)  => {
                        const authHeader = req.headers.authorization                        
                        const authToken = res.setHeader('Set-Cookie', 
                            [`token=${authHeader}; Secure; HttpOnly; Path=/; Max-Age=600`])
                        return true
                    }
                },

                callbackOptions: {
                    afterInstallation: async (installation, options, req, res) => {
                        installation["merchantId"] = res.getHeader("merchantId")
                        installation["installationStatus"] = SlackInstallationStatus.ACTIVE
                        this.logger.log("AfterInstallation:: ", installation)
                        return true
                    },
                    success: (installation, installOptions, req, res) => {
                        res.redirect('/slack/user/static/success.html')
                    }, 
                    failure: (error, installOptions , req, res) => {
                        res.redirect('/slack/user/static/failure.html')
                    }
                },
            },
            
        });
        this.app = new App(runner.appOptions());
        
        runner.setup(this.app);
        this.appRunner = runner;
    }
    
    async handleInstall(req, res) {                
        await this.appRunner.handleInstallPath(req, res)
    }
    
     async handleOauthRedirect(req, res) {
        await this.appRunner.handleCallback(req, res)
    }       

    // async requestHandler(appId, channel) {
    //    try {
    //     let slackInstallation = await this.getSlackInstallationForAppId(appId)
    //     console.log("slack install --> ", slackInstallation)
    //     const client = new WebClient(slackInstallation.botToken, {
    //         logLevel: LogLevel.DEBUG
    //       });
    //     const result = await client.views.publish({
    //       user_id: "U03MJ0MD01X",
    //       view: {
    //         "type": "home",
    //         "blocks": [
    //             {
    //                 "type": "section",
    //                 "text": {
    //                     "type": "mrkdwn",
    //                     "text": "*Welcome home, <@{}> :house:* U03MJ0MD01X",
    //                 },
    //             },
    //         ]    
    //       }
    //     });
    //     console.log(result);
    //   } catch (error) {
    //     console.log(error)
    //   }
    // }

    async handleUninstall(appId){
        let slackInstallation = await this.getSlackInstallationForAppId(appId)
        console.log("slack installation found --> ", slackInstallation)
        if(slackInstallation && slackInstallation.installationStatus == SlackInstallationStatus.ACTIVE){
            const updatedInstallation = await this.prismaClient.slackInstallation.update({
                where: {
                    id: slackInstallation.id
                },
                data: {
                    installationStatus: SlackInstallationStatus.DEACTIVATED
                }
            })
            console.log("Slack app uninstalled: {}", updatedInstallation.appId)
        }    
        return {"status": "success"}
    }

    async handleAppHomeOpen(appId, channelId){
        let slackInstallation = await this.getSlackInstallationForAppId(appId)
        PostHomeViewToSlack(homeTemplate, slackInstallation.botToken, channelId)
    }
}