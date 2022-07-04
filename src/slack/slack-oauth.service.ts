import { Injectable } from '@nestjs/common';
import { AppRunner } from '@seratch_/bolt-http-runner';
import { App, LogLevel } from '@slack/bolt';
import { FileStateStore } from '@slack/oauth';
import { PrismaClient } from "@prisma/client";
import { PrismaInstallationStore } from "slack-bolt-prisma";
import { Request, Response } from 'express';

@Injectable()
export class SlackOAuthService {

    private appRunner: AppRunner;
    //private readonly slackConfig: Config;

    constructor(){
        const prismaClient = new PrismaClient({
            log: [
                {
                    emit: 'stdout',
                    level: 'query',
                },
            ],
        });
        
        const installationStore = new PrismaInstallationStore({    
            prismaTable: prismaClient.slackAppInstallation,
            historicalDataEnabled: false,
            clientId: process.env.SLACK_CLIENT_ID,
            onStoreInstallation: async ({ prismaInput, installation, idToUpdate }) => {
                console.log("onStoreInstallation")
                console.log("---> ", installation);
                console.log("---> ", prismaInput);
                console.log("ID to update -->", idToUpdate)
                installation.metadata = String(idToUpdate)
            },
        });
        
        const runner = new AppRunner({
            logLevel: LogLevel.DEBUG,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            signingSecret: process.env.SLACK_SIGNING_SECRET!,
            clientId: process.env.SLACK_CLIENT_ID,
            clientSecret: process.env.SLACK_CLIENT_SECRET,
            scopes: ['commands', 'chat:write', 'app_mentions:read'],          
            installationStore: installationStore,          
            installerOptions: {
                directInstall: true,
                stateStore: new FileStateStore({}),
                callbackOptions: {
                    success: (installation, installOptions, req, res) => {
                        // Do custom success logic here
                        res.setHeader("update_id", parseInt(installation.metadata, 10))    
                    }, 
                    failure: (error, installOptions , req, res) => {
                        // Do custom failure logic here
                        res.setHeader("status", 400)                        
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
    
    public async handleInstall(req: Request, res: Response) {        
        await this.appRunner.handleInstallPath(req, res)
    }
    
    public async handleOauthRedirect(req: Request, res: Response) {
        await this.appRunner.handleCallback(req, res)
    }
}