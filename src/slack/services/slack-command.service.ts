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

const yargs = require('yargs/yargs')

const COMMAND = "/testcommand"
const SUBSCRIBE = 'subscribe'
const UNSUBSCRIBE = 'unsubscribe'
const FETCH = 'fetch'

const enum SlackSubscriptionStatus {
    ACTIVE = "active",
    DISABLED = "disabled"
}

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
        let eventNotif;
        switch(cmd){
            case SUBSCRIBE:
                [eventNotif, response] = await this.handleEventSubscription(slashCommand, command)
                break;
            case UNSUBSCRIBE:
                [eventNotif, response] = await this.handleEventUnsubscription(slashCommand, command)
                break;
            case FETCH:
                [eventNotif, response] = await this.handleFetchCommand(slashCommand, command)
                break;
            default:
                break;
       }
       eventNotif.setCommand(command)
       return [eventNotif, response];
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
            case FETCH:
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
        const existing = await this.slackPrismaSvc.fetchSubscription(command, slashCmd.api_app_id)
        if(existing && existing.eventStatus == SlackSubscriptionStatus.ACTIVE){
            return [null, failedSubscription("There already exists an active subscription for this event!")]
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
        return [null, successfulSubscription(command)]
    }

    private async handleEventUnsubscription(slashCmd: SlashCommand, command: ICommonCommand){
        const existing = await this.slackPrismaSvc.fetchSubscription(command, slashCmd.api_app_id)
        if(!existing){
            return [false, failedUnSubscription("No active subscription was found for this event.")]
        }
        await this.prismaClient.slackEventSubscription.update({
            where: {
                id: existing.id
            },
            data: {
                eventStatus: SlackSubscriptionStatus.DISABLED
            }
        })
        return [null, successfulUnSubscription(command)]
    }

    private async handleFetchCommand(slashCmd: SlashCommand, command: ICommonCommand){
        //if we have come this far, we must go ahead as well
        return [new FetchDataEvent(command.eventId), fetchCmdSuccessful(command)]
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

    public randomMethod(){
        console.log("RANDOM METHOD CALLED!!")
    }


}
