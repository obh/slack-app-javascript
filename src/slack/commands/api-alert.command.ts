import { SlackInstallation } from "@prisma/client";
import { Block, SlashCommand } from "@slack/bolt";
import { ICommandControlPanel } from "./common.command";
import { plainToClass } from 'class-transformer';
let axios = require('axios');

@ICommandControlPanel.register
export class APIAlertCommand {
    
    readonly eventId = "api-alert"
    readonly eventDescription: string = "This event helps you fetch summary of API errors in Cashfree"
    readonly slashCommand: SlashCommand;
    readonly slackInstallation: SlackInstallation;
    data: APIAlertData;

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

    async parseData(data: any) {
        const d = plainToClass(APIAlertData, data)
        if(d instanceof APIAlertData) {
            this.data = d
        }        
    }

    async fetchData(){
        const data = await fetchRandomData();
        console.log("Fetched data in fetchData: ", data instanceof APIAlertData)
        if(data instanceof APIAlertData){
            console.log("setting data to correct value")
            this.data = data;
        }        
    }    

}

const fetchRandomData = async() => {
    try {
        const response = await axios.get("https://random-data-api.com/api/stripe/random_stripe");
        if(response.status === 200){
            return plainToClass(APIAlertData, response.data)
        }
        else {
            return {"error": "Error fetching data"}
        }
      } catch(err) {
        console.log("error: ", err);
      }
  }

// This is just dummy data for now
class APIAlertData {
    id: Number;
    uid: string;
    valid_card: string;
    token: string;
    invalid_card: string;
    month: string;
    year: string;
    cvv: string;
    cvv_amex: string;

    toSlackBlock() {
        return [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: "*API Alert*"
                }
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: "*ID:* " + this.id
                }
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: "*UID:* " + this.uid
                }
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: "*Valid Card:* " + this.valid_card
                }
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: "*Token:* " + this.token
                }
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: "*Invalid Card:* " + this.invalid_card
                }
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: "*Month:* " + this.month
                }
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: "*Year:* " + this.year
                }
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: "*CVV:* " + this.cvv
                }
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: "*CVV Amex:* " + this.cvv_amex
                }
            }
        ]        
    }
}

