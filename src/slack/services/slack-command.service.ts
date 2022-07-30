import { Inject, Injectable } from "@nestjs/common";
import { PrismaClient, Prisma } from "@prisma/client";
import { SlashCommand } from "@slack/bolt";
import { SlackError } from "src/common/interceptors/exception.interceptor";
import { parseSubscribeCommand, parseFetchCommand } from "../commands";
import { ICommonCommand } from "../commands/common.command";
import { failedSubscription, successfulSubscription} from "../templates/slack-subscribe.template";
import { failedUnSubscription, successfulUnSubscription } from "../templates/slack-unsubscribe.template";
import { fetchCmdSuccessful } from "../templates/slack-fetch.template";
import { FetchDataEvent, SEvent } from "../events/interface/fetch-data.event";
import { SlackPrismaService } from "./prisma.service";
import { SlackSubscriptionStatus } from "../utils/slack.utils";
import { helpTemplate } from "../templates/slack-help.template";

const yargs = require('yargs/yargs')

const COMMAND = "/testcommand"
const SUBSCRIBE = 'subscribe'
const UNSUBSCRIBE = 'unsubscribe'
const FETCH = 'fetch'
const HELP = 'help'

//This is just for the parsing logic which is used by yargs
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
    
    @Inject(SlackPrismaService)
    private slackPrismaSvc: SlackPrismaService;
    
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

    public async handleCommand(slashCommand: SlashCommand): Promise<[SEvent, object]> {
        const [cmd, command] = this.parseAndValidate(slashCommand)
        let response;
        let eventNotif = null;
        if([SUBSCRIBE, UNSUBSCRIBE, FETCH].includes(cmd) && !command){
            throw new SlackError("Oops! Failed to find a matching event: " + slashCommand.text)
        }
        switch(cmd){
            case SUBSCRIBE:
                response = await this.handleEventSubscription(slashCommand, command)
                eventNotif = null;
                break;
            case UNSUBSCRIBE:
                response = await this.handleEventUnsubscription(slashCommand, command)
                eventNotif = null;
                break;
            case FETCH:
                response = await this.handleFetchCommand(slashCommand, command)
                eventNotif = new FetchDataEvent(command.eventId, command)
                break;
            case HELP:
                response = this.handleHelpCommand()
                eventNotif = null;
                break;            
            default:
                break;
       }       
       return [eventNotif, response];
    }

    private parseAndValidate(slashCommand: SlashCommand): [string, ICommonCommand] {
        const cmdArgs = yargs(slashCommand.text)
                .exitProcess(false)
                .command(subscribeCmd)
                .command(unsubscribeCmd)
                .command(fetchCmd)              
                .parse()

        if(cmdArgs._.length == 0 && slashCommand.text != HELP){
            throw new SlackError("Oops! Failed to parse this command: " + slashCommand.text)
        }
        const cmd = cmdArgs._.length >= 1 ? cmdArgs._[0].toLowerCase() : HELP
        console.log("Command: " + cmd, cmdArgs)
        const event = cmdArgs.event
        // check first part
        let parsedCmd : ICommonCommand;
        switch(cmd) {
            case SUBSCRIBE:            
            case UNSUBSCRIBE:
                parsedCmd = parseSubscribeCommand(event)
                break
            case FETCH:
                parsedCmd = parseFetchCommand(event)
                break
            case HELP:
                //do nothing
                break;
            default: 
                //log error here
                throw new SlackError("Oops! Failed to find a matching command: " + cmd)
        }       
        return [cmd, parsedCmd]
    }

    //should we check for if slackinstallation already has some other subscription? 
    private async handleEventSubscription(slashCmd: SlashCommand, command: ICommonCommand){
        const existing = await this.slackPrismaSvc.fetchSubscription(command, slashCmd.api_app_id)
        if(existing && existing.eventStatus == SlackSubscriptionStatus.SUBSCRIBED){
            return failedSubscription("There already exists an active subscription for this event!")
        }
        const eventSubscription:Prisma.SlackEventSubscriptionCreateInput = this.prepareSubscription(command, slashCmd)
        let merchantId = 0
        if(!existing){
            const slackInstall = await this.slackPrismaSvc.fetchActiveInstallation(slashCmd.api_app_id)
            merchantId = slackInstall ? slackInstall.merchantId : merchantId
        } else {
            merchantId = existing ? existing.merchantId : merchantId
        }
        if(merchantId == 0){
            throw new SlackError("Found error when subscribing to event!")
        }
        eventSubscription.merchantId = merchantId
        eventSubscription.updatedOn = new Date()
        await this.prismaClient.slackEventSubscription.upsert({
            where: {id: existing ? existing.id : 0},
            update: {...eventSubscription},
            create: {...eventSubscription}
        })                
        return successfulSubscription(command)
    }

    private async handleEventUnsubscription(slashCmd: SlashCommand, command: ICommonCommand){
        const existing = await this.slackPrismaSvc.fetchSubscription(command, slashCmd.api_app_id)
        if(!existing){
            return failedUnSubscription("No active subscription was found for this event.")
        }
        await this.prismaClient.slackEventSubscription.update({
            where: {
                id: existing.id
            },
            data: {
                eventStatus: SlackSubscriptionStatus.UNSUBSCRIBED,
                updatedOn: new Date()
            }
        })
        return successfulUnSubscription(command)
    }

    private async handleFetchCommand(slashCmd: SlashCommand, command: ICommonCommand){
        //if we have come this far, we must go ahead as well
        return fetchCmdSuccessful(command)
    }

    private handleHelpCommand(){
        return helpTemplate
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
            eventStatus: SlackSubscriptionStatus.SUBSCRIBED,
            text: slashCommand.text,
            triggerId: slashCommand.trigger_id,
            addedOn: new Date()
        };
        return installation
    }

}
