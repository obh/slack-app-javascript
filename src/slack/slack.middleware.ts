// import { Injectable, NestMiddleware } from "@nestjs/common";
// import { Request, Response, NextFunction } from 'express'
// import { AppRunner } from '@seratch_/bolt-http-runner';
// import { App, LogLevel } from '@slack/bolt';
// import { FileStateStore } from '@slack/oauth';
// import { PrismaClient } from "@prisma/client";
// import { PrismaInstallationStore } from "slack-bolt-prisma";

// @Injectable()
// export class SlackBoltMiddleware implements NestMiddleware {
//     private appRunner: AppRunner;
    
//     public constructor() {
//         const prismaClient = new PrismaClient({
//             log: [
//                 {
//                     emit: 'stdout',
//                     level: 'query',
//                 },
//             ],
//         });
        
//         const installationStore = new PrismaInstallationStore({    
//             prismaTable: prismaClient.slackAppInstallation,
//             historicalDataEnabled: false,
//             clientId: process.env.SLACK_CLIENT_ID,
//             onStoreInstallation: async ({ prismaInput, installation }) => {
//                 console.log("onStoreInstallation")
//                 console.log("---> ", installation);
//                 console.log("---> ", prismaInput);
//                 prismaInput.memo = 'test';
//             },
//         });
        
//         const runner = new AppRunner({
//             logLevel: LogLevel.DEBUG,
//             // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//             signingSecret: process.env.SLACK_SIGNING_SECRET!,
//             clientId: process.env.SLACK_CLIENT_ID,
//             clientSecret: process.env.SLACK_CLIENT_SECRET,
//             scopes: ['commands', 'chat:write', 'app_mentions:read'],          
//             installationStore: installationStore,          
//             installerOptions: {
//                 directInstall: true,
//                 stateStore: new FileStateStore({}),
//                 callbackOptions: {
//                     success: (installation, installOptions, req, res) => {
//                         // Do custom success logic here
//                         res.writeHead(200, { 'Content-Type': 'text/plain',});
//                         res.write("success")
//                         res.end()
//                     }, 
//                     failure: (error, installOptions , req, res) => {
//                         // Do custom failure logic here
//                         res.writeHead(200, { 'Content-Type': 'text/plain',});
//                         res.write("failure")
//                         res.end()
                        
//                     }
//                 },
//             },
            
//         });
//         const app = new App(runner.appOptions());
        
//         app.event('app_mention', async ({ say }) => {
//             await say('Hi there!');
//         });
        
//         runner.setup(app);
//         this.appRunner = runner;
//     }
    
//     async use(req: Request, res: Response, next: NextFunction) {
//         if (req.path === '/events') {           
//             console.log("received event")
//             await this.appRunner.handleEvents(req, res);
//             next();
//         } else if (req.path === '/install') {
//             await this.appRunner.handleInstallPath(req, res);
//         } else if (req.path === '/oauth_redirect') {
//             await this.appRunner.handleCallback(req, res);
//             //res.redirect('/thanks');
//         } else {
//             next();
//         }
//     }
    
// }