import { SlackInstallation } from "@prisma/client";
import { SlashCommand } from "@slack/bolt";
import { ICommandControlPanel } from "./common.command";

@ICommandControlPanel.register
export class APIAlertCommand {
    
    readonly eventId = "api-alert"
    readonly eventDescription: string = "This event helps you fetch summary of API errors in Cashfree"
    readonly slashCommand: SlashCommand;
    readonly slackInstallation: SlackInstallation;

    //Command instance also needs to have the payload

    constructor(slashCmd: SlashCommand, slackInstall: SlackInstallation){
        this.slashCommand = slashCmd
        this.slackInstallation = slackInstall
     }

    canSubscribe(): boolean {
        return true;
    }

    canFetch(): boolean {
        return true;
    }

    validate(slackInstallation: SlackInstallation): boolean {
        return true;
    }

    fetch(){
        const merchantId = this.slackInstallation.merchantId;

    }

    private fetchAppId(){
        
    }

}