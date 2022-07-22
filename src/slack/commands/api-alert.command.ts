import { SlackInstallation } from "@prisma/client";
import { SlashCommand } from "@slack/bolt";
import { ICommandControlPanel } from "./common.command";
let axios = require('axios');

@ICommandControlPanel.register
export class APIAlertCommand {
    
    readonly eventId = "api-alert"
    readonly eventDescription: string = "This event helps you fetch summary of API errors in Cashfree"
    readonly slashCommand: SlashCommand;
    readonly slackInstallation: SlackInstallation;
    data: object;

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

    async fetchData(){
        const data = await this.fetchRandomData();
        this.data = data;
    }

    private async fetchRandomData(){
        const url = "https://gorest.co.in/public/v2/users/13"
        const requestOptions = {
            method: 'GET',
            headers: {
                "content-type": "application/json"
            },
        };
        const response = await axios.get(url, requestOptions)
        if(response.status == 200){
            return response.json
        }
    }

}