import { Injectable } from "@nestjs/common";
import { SlackEventSubscription } from "@prisma/client";
import { SlackInstallation } from "@prisma/client";
import { PrismaClient, Prisma } from "@prisma/client";
import { SlashCommand } from "@slack/bolt";
import { failedSubscription, successfulSubscription } from "../templates/slack-subscribe";

const COMMAND = "/testcommand"

export enum CashfreeCommands {
    SUBSCRIBE = 'subscribe',
    UNSUBSCRIBE = 'unsubscribe',
}

export interface SlackCommand {
    command: CashfreeCommands
    event: SubscriptionEvent
    slashCommand: SlashCommand
}

export interface SubscriptionEvent {
    id: string
    eventName: string
    needsOwner: boolean
    description: string
}

const SubscriptionEvents:Array<SubscriptionEvent> = [
    {
        id: "sr-drop",
        eventName: "Personalized Success Rate Notifications",
        needsOwner: true,
        description: "Get notified whenever your success rate drops below a threshold."
    }, 
    {
        id: "downtime",
        eventName: "Payment Instrument Downtme",
        needsOwner: false,
        description: "Get notified whenever a bank or app is facing issues",
    }, 
    {
        id: "pg-api-errors",
        eventName: "API errors",
        needsOwner: false,
        description: "Get notified whenever an API call to Cashfree fails", 
    }
]

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
        const [errorMsg, slackCmd] = this.parseAndValidate(slashCommand)
        if(errorMsg){
            return errorMsg
        }
        this.handleEventSubscription(slackCmd, slackInstallation)
    }

    private parseAndValidate(slashCommand: SlashCommand): [object, SlackCommand] {
        if(slashCommand.command != COMMAND){
            return [failedSubscription("command not found!"), null]
        }
        const parts = slashCommand.text.split(" ")
        const cmd = parts[0]
        // check first part
        const indexOfS = Object.values(CashfreeCommands).indexOf(cmd as unknown as CashfreeCommands);
        const cmdFound:CashfreeCommands = (<any>CashfreeCommands) [indexOfS]
        if(!cmdFound){
            return [failedSubscription("Not a valid command!. Please try one of: "), null]
        }
        if(cmdFound == CashfreeCommands.SUBSCRIBE || cmdFound == CashfreeCommands.UNSUBSCRIBE){
            const eventFound = SubscriptionEvents.find((event) => event.id === parts[1])
            if(!eventFound){
                return [failedSubscription("Not a valid event. Please view all valid commands here!"), null]    
            }
            const slackCmd:SlackCommand = {
                command:  cmdFound,
                event: eventFound,
                slashCommand: slashCommand
            }
            return [null, slackCmd]
        }
        return [failedSubscription("Not a valid comand. Please view all valid commands here!"), null]
    }

    private async handleEventSubscription(slackCmd: SlackCommand, slackInstallation: SlackInstallation){
        const existing = await this.fetchSubscription(slackCmd.event, slackCmd.slashCommand.api_app_id)
        if(existing && existing.eventStatus == 'ACTIVE'){
            return failedSubscription("There already exists an active subscription for this event!")
        } 
        const eventSubscription:Prisma.SlackEventSubscriptionCreateInput = this.prepareSubscription(slackCmd.event, slackCmd.slashCommand)
        eventSubscription["merchantId"] = slackInstallation.merchantId;
        if(!existing){
            this.prismaClient.slackEventSubscription.create({
                data: eventSubscription
            })
        } else {
            this.prismaClient.slackEventSubscription.update({
                where: {
                    id: existing.id
                }, 
                data: eventSubscription
            })
        }
        return successfulSubscription(slackCmd.event)
    }

    private async fetchSubscription(subscriptionEvent: SubscriptionEvent, appId: string): Promise<SlackEventSubscription>{
        return await this.prismaClient.slackEventSubscription.findFirst({
            where: {
                event: subscriptionEvent.id,
                appId: appId,
            }
        });
    }

    private prepareSubscription(subscriptionEvent: SubscriptionEvent, slashCommand: SlashCommand){
        let installation = {
            appId: slashCommand.api_app_id,
            enterpriseId: slashCommand.enterprise_id,
            teamId: slashCommand.team_id,
            channelId: slashCommand.channel_id,
            channelName: slashCommand.channel_name,
            userId: slashCommand.user_id,
            userName: slashCommand.user_name,
            command: slashCommand.command,
            event: subscriptionEvent.id,
            text: slashCommand.text,
            triggerId: slashCommand.trigger_id,
        };
        return installation
    }

    // public subscribe()

}
