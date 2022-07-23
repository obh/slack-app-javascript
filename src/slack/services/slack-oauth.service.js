import { Injectable } from '@nestjs/common';
import { AppRunner } from '@seratch_/bolt-http-runner';
import { App, LogLevel } from '@slack/bolt';
import { PrismaInstallationStore } from "slack-bolt-prisma";
import { PrismaClient } from '@prisma/client';
import { PostHomeViewToSlack, PostToSlack, SlackInstallationStatus } from '../utils/slack.utils';
import { homeTemplate } from '../templates/slack-home.template';
const { WebClient, LogLevel } = require("@slack/web-api");

const scopes = ['channels:read', 'chat:write', 'commands', 'chat:write.customize']

@Injectable()
export class SlackOAuthService {

    appRunner;
    app;
    prismaClient;
    //private readonly slackConfig: Config;

    constructor(){
        this.prismaClient = new PrismaClient({
            log: [
                {
                    emit: 'stdout',
                    level: 'query',
                },
            ],
        });
        
        const installationStore = new PrismaInstallationStore({    
            prismaTable: this.prismaClient.slackInstallation,
            historicalDataEnabled: false,
            clientId: process.env.SLACK_CLIENT_ID,
            onStoreInstallation: async ({ prismaInput, installation, idToUpdate }) => {
                console.log("onStoreInstallation")
                prismaInput.merchantId = installation.merchantId
                prismaInput.installationStatus = installation.installationStatus
                console.log("---> ", installation);
                console.log("---> ", prismaInput);
            },
        });
        
        const runner = new AppRunner({
            logLevel: LogLevel.DEBUG,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            stateSecret: process.env.SLACK_STATE_SECRET,
            signingSecret: process.env.SLACK_SIGNING_SECRET,
            clientId: process.env.SLACK_CLIENT_ID,
            clientSecret: process.env.SLACK_CLIENT_SECRET,
            scopes: scopes, 
            installationStore: installationStore,          
            installerOptions: {
                directInstall: true,
                installPathOptions: {
                    beforeRedirection: async(req, res, options)  => {
                        const tenantId = req.headers.authorization                        
                        const authToken = res.setHeader('Set-Cookie', [`token=${tenantId}; Secure; HttpOnly; Path=/; Max-Age=600`])
                        return true
                    }
                },

                callbackOptions: {
                    afterInstallation: async (installation, options, req, res) => {
                        installation["merchantId"] = res.getHeader("merchantId")
                        installation["installationStatus"] = SlackInstallationStatus.ACTIVE
                        console.log("my installation is --> ", installation)
                        return true
                    },
                    success: (installation, installOptions, req, res) => {
                        res.writeHead(200, {'Content-Type': 'text/plain'});
                        res.write('Hello World!');
                        res.end()
                    }, 
                    failure: (error, installOptions , req, res) => {
                        res.writeHead(200, {'Content-Type': 'text/plain'});
                        res.write('Installation failed!');
                        res.end()
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

    async getSlackInstallationForMerchant(merchantId){
        if(!merchantId){
            return null
        }
        const slackInstallation = this.prismaClient.slackInstallation.findFirst({
            where: {
                merchantId: merchantId,
                installationStatus: SlackInstallationStatus.ACTIVE
            }
        });
        return slackInstallation
    }

    async getSlackInstallationForAppId(slackAppId){
        if(!slackAppId){
            return null
        }
        console.log("Searching for slack installation where appId: {} and status is ACTIVE", slackAppId)
        const slackInstallation = this.prismaClient.slackInstallation.findFirst({
            where: {
                appId: slackAppId,
                installationStatus: SlackInstallationStatus.ACTIVE
            }
        });
        return slackInstallation
    }

    async requestHandler(appId, channel) {
       try {
        let slackInstallation = await this.getSlackInstallationForAppId(appId)
        console.log("slack install --> ", slackInstallation)
        const client = new WebClient(slackInstallation.botToken, {
            logLevel: LogLevel.DEBUG
          });
        const result = await client.views.publish({
          user_id: "U03MJ0MD01X",
          view: {
            "type": "home",
            "blocks": [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "*Welcome home, <@{}> :house:* U03MJ0MD01X",
                    },
                },
            ]    
          }
        });
        console.log(result);
      } catch (error) {
        console.log(error)
      }
    }

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
    }

    async handleAppHomeOpen(appId, channelId){
        let slackInstallation = await this.getSlackInstallationForAppId(appId)
        PostHomeViewToSlack(homeTemplate, slackInstallation.botToken, channelId)
    }
}