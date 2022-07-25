import { SEvent } from "./fetch-data.event";


export class WebhookDataEvent extends SEvent {
    data: any;
    
    constructor(eventId: string){
        super(eventId);
    }
    
    setData(data: any){
        this.data = data;
    }
}