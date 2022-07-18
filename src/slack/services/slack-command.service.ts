import { Injectable } from "@nestjs/common";
import { SlackEventSubscription } from "@prisma/client";
import { SlackInstallation } from "@prisma/client";
import { PrismaClient, Prisma } from "@prisma/client";
import { SlashCommand } from "@slack/bolt";
import { SlackError } from "src/common/interceptors/exception.interceptor";
import { parseSubscribeCommand, parseFetchCommand } from "../commands";
import { ICommonCommand } from "../commands/common.command";
import { failedSubscription, successfulSubscription} from "../templates/slack-subscribe.template";
import { failedUnSubscription, successfulUnSubscription } from "../templates/slack-unsubscribe.template";
const yargs = require('yargs/yargs')

const COMMAND = "/testcommand"
const SUBSCRIBE = 'subscribe'
const UNSUBSCRIBE = 'unsubscribe'

const enum SlackSubscriptionStatus {
    ACTIVE = "active",
    DISABLED = "disabled"
}

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
            case SUBSCRIBE:
                response = this.handleEventSubscription(slashCommand, command)
                break;
            case UNSUBSCRIBE:
                response = this.handleEventUnsubscription(slashCommand, command)
                break;
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
            throw new SlackError("Oops! Failed to parse this command: " + slashCommand.text)
        }
        const cmd = cmdArgs._[0].toLowerCase()
        const event = cmdArgs.event
        // check first part
        let parsedCmd : boolean | ICommonCommand;
        switch(cmd) {
            case SUBSCRIBE:            
            case UNSUBSCRIBE:
                parsedCmd = parseSubscribeCommand(event)
                break
            case 'fetch':
                parsedCmd = parseFetchCommand(event)
                break
            default: 
                //log error here
                throw new SlackError("Oops! Failed to find a matching command: " + cmd)
        }       
        if(!parsedCmd){
            throw new SlackError("Oops! Failed to find a matching event: " + event)
        }
        return [cmd, parsedCmd as ICommonCommand]
    }

    //should we check for if slackinstallation already has some other subscription? 
    private async handleEventSubscription(slashCmd: SlashCommand, command: ICommonCommand){
        const existing = await this.fetchSubscription(command, slashCmd.api_app_id)
        if(existing && existing.eventStatus == SlackSubscriptionStatus.ACTIVE){
            return failedSubscription("There already exists an active subscription for this event!")
        }
        const eventSubscription:Prisma.SlackEventSubscriptionCreateInput = this.prepareSubscription(command, slashCmd)
        let merchantId = 0
        if(!existing){
            const slackInstall = await this.fetchInstallation(slashCmd.api_app_id)
            merchantId = slackInstall ? slackInstall.merchantId : merchantId
        } else {
            merchantId = existing ? existing.merchantId : merchantId
        }
        if(merchantId == 0){
            throw new SlackError("Found error when subscribing to event!")
        }
        eventSubscription.merchantId = merchantId        
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

    private async handleEventUnsubscription(slashCmd: SlashCommand, command: ICommonCommand){
        const existing = await this.fetchSubscription(command, slashCmd.api_app_id)
        if(!existing){
            failedUnSubscription("No active subscription was found for this event.")
        }
        await this.prismaClient.slackEventSubscription.update({
            where: {
                id: existing.id
            },
            data: {
                eventStatus: SlackSubscriptionStatus.DISABLED
            }
        })
        return successfulUnSubscription(command)
    }

    private async fetchSubscription(subscriptionEvent: ICommonCommand, appId: string): Promise<SlackEventSubscription>{
        return await this.prismaClient.slackEventSubscription.findFirst({
            where: {
                event: subscriptionEvent.eventId,
                appId: appId,
            }
        });
    }

    private async fetchInstallation(appId: string): Promise<SlackInstallation>{
        return await this.prismaClient.slackInstallation.findFirst({
            where: {
                appId: appId
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
            eventStatus: SlackSubscriptionStatus.ACTIVE,
            text: slashCommand.text,
            triggerId: slashCommand.trigger_id,
        };
        return installation
    }


}
