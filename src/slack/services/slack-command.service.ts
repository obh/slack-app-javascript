import { Injectable } from "@nestjs/common";
import { SlackEventSubscription } from "@prisma/client";
import { SlackInstallation } from "@prisma/client";
import { PrismaClient, Prisma } from "@prisma/client";
import { SlashCommand } from "@slack/bolt";
import { parseSubscribeCommand, parseFetchCommand } from "../commands";
import { ICommonCommand } from "../commands/common.command";
import { failedSubscription, successfulSubscription, successfulUnsubscription } from "../templates/slack-subscribe.template";
const yargs = require('yargs/yargs')

const COMMAND = "/testcommand"

const subscribeCmd = {
    command: 'subscribe <event>',
    desc: 'Subscribe to an event notifications.',
}
const unsubscribeCmd = {
    command: 'unsubscribe <event>',
    desc: 'Unsubscribe from event notifications.'
}
const fetchCmd = {
    command: 'fetch <event>',
    desc: 'Fetch data in realtime from Cashfree.'
}



@Injectable()
export class SlackCommandService {
    
    private prismaClient: PrismaClient;
    
    constructor(){
        this.prismaClient = new PrismaClient({
            log: [
                {
                    emit: 'stdout',
                    level: 'query',
                },
            ],
        });
    }

    public handleCommand(slashCommand: SlashCommand, slackInstallation: SlackInstallation){
        const [cmd, command] = this.parseAndValidate(slashCommand)
        let response ;
        switch(cmd){
            case 'subscribe':
                response = this.handleEventSubscription(slashCommand, command)
            case 'unsubsribe':
                response = this.handleEventUnsubscription(slashCommand, command)
            default:
                break;
       }
       return response;
    }

    private parseAndValidate(slashCommand: SlashCommand): [string, ICommonCommand] {
        const cmdArgs = yargs(slashCommand.text)
            .command(subscribeCmd)
            .command(unsubscribeCmd)
            .command(fetchCmd)
            .parse()
        
        if(cmdArgs._.length == 0){
            throw new Error("Failed to parse this command: " + slashCommand.text)
        }
        const cmd = cmdArgs._[0].toLowerCase()
        const event = cmdArgs.event
        // check first part
        let parsedCmd : boolean | ICommonCommand;
        switch(cmd) {
            case 'subscribe':            
            case 'unsubscribe':
                parsedCmd = parseSubscribeCommand(event)
                break
            case 'fetch':
                parsedCmd = parseFetchCommand(event)
                break
            default: 
                //log error here
                throw new Error("Failed to find a matching command: " + cmd)
        }       
        if(!parsedCmd){
            throw new Error("Failed to find a matching event: " + event)
        }
        return [cmd, parsedCmd as ICommonCommand]
    }

    //should we check for if slackinstallation already has some other subscription? 
    private async handleEventSubscription(slackCmd: SlashCommand, command: ICommonCommand){
        const existing = await this.fetchSubscription(command, slackCmd.slashCommand.api_app_id)
        console.log("existing subscription --> ", existing)
        if(existing && existing.eventStatus == 'ACTIVE'){
            return failedSubscription("There already exists an active subscription for this event!")
        } 
        const eventSubscription:Prisma.SlackEventSubscriptionCreateInput = this.prepareSubscription(
            command, slackCmd.slashCommand)
        eventSubscription["merchantId"] = existing.merchantId;
        if(!existing){
            await this.prismaClient.slackEventSubscription.create({
                data: eventSubscription
            })
        } else {
            await this.prismaClient.slackEventSubscription.update({
                where: {
                    id: existing.id
                }, 
                data: eventSubscription
            })
        }
        return successfulSubscription(command)
    }

    private async handleEventUnsubscription(slackCmd: SlashCommand, command: ICommonCommand){
        const existing = await this.fetchSubscription(command, slackCmd.slashCommand.api_app_id)
        if(!existing){
            //oops not found need to return something
        }
        await this.prismaClient.slackEventSubscription.update({
            where: {
                id: existing.id
            },
            data: {
                eventStatus: 'UNSUBSCRIBED'
            }
        })
        return successfulUnsubscription(command)
    }

    private async fetchSubscription(subscriptionEvent: ICommonCommand, appId: string): Promise<SlackEventSubscription>{
        return await this.prismaClient.slackEventSubscription.findFirst({
            where: {
                event: subscriptionEvent.eventId,
                appId: appId,
            }
        });
    }

    private prepareSubscription(subscriptionEvent: ICommonCommand, slashCommand: SlashCommand){
        let installation = {
            appId: slashCommand.api_app_id,
            enterpriseId: slashCommand.enterprise_id,
            teamId: slashCommand.team_id,
            channelId: slashCommand.channel_id,
            channelName: slashCommand.channel_name,
            userId: slashCommand.user_id,
            userName: slashCommand.user_name,
            command: slashCommand.command,
            event: subscriptionEvent.eventId,
            text: slashCommand.text,
            triggerId: slashCommand.trigger_id,
        };
        return installation
    }


}
