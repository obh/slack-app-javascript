import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { SlashCommand } from "@slack/bolt";
import { CommandNotFoundError } from "src/common/interceptors/exception.interceptor";

const Commands = ["/testcommand"]

const SUBSCRIBE_CMD = 'subscribe';
const UNSUBSCRIBE_CMD = 'unsubscribe';
const FETCH_CMD = 'unsubscribe';
const SubCommand = [SUBSCRIBE_CMD, UNSUBSCRIBE_CMD, FETCH_CMD]

interface SubscriptionEvent {
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
    
    private prismaClient;
    
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

    public parseAndValidate(slashCommand: SlashCommand){
        let found: String = Commands.find((i) => (i === slashCommand.command))
        if(!found){
            throw new CommandNotFoundError("Command not found")
        }
        const parts = slashCommand.text.split(" ")
        const subCommand = parts[0]
        found = SubCommand.find((i) => (i === subCommand))
        if(!found){
            throw new CommandNotFoundError("Not a valid subcommand: " + subCommand)
        }
        const eventFound = SubscriptionEvents.find((event) => event.id === parts[1])
        if(subCommand == SUBSCRIBE_CMD && eventFound){
            this.handleSubscription(eventFound, slashCommand);
        }
    }

    private handleSubscription(subscriptionEvent: SubscriptionEvent, slashCommand: SlashCommand){

    }

    private fetchSubscription(subscriptionEvent: SubscriptionEvent){
        return this.prismaClient.find({
            where: {
                
            }
        })
    }

    // public subscribe()

}
