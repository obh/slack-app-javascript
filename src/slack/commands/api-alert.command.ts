import { SlackInstallation } from "@prisma/client";
import { ICommonCommand } from "./common.command";

export class APIAlertCommand implements ICommonCommand {
    
    readonly eventId = "api-alert"
    readonly eventDescription: string = "This event helps you fetch summary of API errors in Cashfree"

    //Command instance also needs to have the payload

    constructor(){ }

    canSubscribe(): boolean {
        return true;
    }

    canFetch(): boolean {
        return true;
    }

    validate(slackInstallation: SlackInstallation): boolean {
        return true;
    }
}