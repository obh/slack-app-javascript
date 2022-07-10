import { Injectable } from '@nestjs/common';
import { AppRunner } from '@seratch_/bolt-http-runner';
import { App, LogLevel } from '@slack/bolt';
import { PrismaInstallationStore } from "slack-bolt-prisma";
import { PrismaClient } from '@prisma/client';
import { SlackInstallationStatus } from '../utils/slack.utils';

const scopes = ['commands', 'chat:write', 'app_mentions:read']

@Injectable()
export class SlackOAuthService {

    appRunner;
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
            prismaTable: this.prismaClient.slackAppInstallation,
            historicalDataEnabled: false,
            clientId: process.env.SLACK_CLIENT_ID,
            onStoreInstallation: async ({ prismaInput, installation, idToUpdate }) => {
                console.log("onStoreInstallation")
                prismaInput.merchantId = installation.merchantId
                prismaInput.installationStatus = installation.installationStatus
                // prismaInput["installationStatus"] = "ACTIVE"
                console.log("---> ", installation);
                console.log("---> ", prismaInput);
                //console.log("ID to update -->", idToUpdate)
            },
        });
        
        const runner = new AppRunner({
            logLevel: LogLevel.DEBUG,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            stateSecret: "87bhuadsf12312bdsf!dfabdf1239134",
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
        const app = new App(runner.appOptions());
        
        app.event('app_mention', async ({ say }) => {
            await say('Hi there!');
        });
        
        runner.setup(app);
        this.appRunner = runner;
    }
    
    async handleInstall(req, res) {                
        await this.appRunner.handleInstallPath(req, res)
    }
    
     async handleOauthRedirect(req, res) {
        await this.appRunner.handleCallback(req, res)
    }

    async getSlackInstallationForMerchant(merchantId){
        const slackInstallation = this.prismaClient.slackAppInstallation.findFirst({
            where: {
                merchantId: merchantId,
                installationStatus: SlackInstallationStatus.ACTIVE
            }
        });
        return slackInstallation
    }
}