import { ICommonCommand } from "src/slack/commands/common.command";
import { SEvent } from "./fetch-data.event";


export class WebhookDataEvent extends SEvent {
    data: any;
    
    constructor(eventId: string, command: ICommonCommand, data: any){
        super(eventId, command);
        this.data = data
    }
    
    setData(data: any){
        this.data = data;
    }
}