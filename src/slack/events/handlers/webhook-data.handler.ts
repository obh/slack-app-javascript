import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { WebhookDataEvent } from "../interface/webhook-data.event";

@EventsHandler(WebhookDataEvent)
export class WebhookDataEventHandler implements IEventHandler<WebhookDataEvent>{
    
    async handle(event: WebhookDataEvent){
        console.log("handling webhook data event");
    }

}