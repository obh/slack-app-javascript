import { Logger } from "@nestjs/common";
import { EventBus, EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { SendSlackEvent } from "../interface/send-slack.event";
import { WebhookDataEvent } from "../interface/webhook-data.event";

@EventsHandler(WebhookDataEvent)
export class WebhookDataEventHandler implements IEventHandler<WebhookDataEvent>{
    
    private readonly logger = new Logger(WebhookDataEventHandler.name);

    constructor(private eventBus: EventBus){}
    
    async handle(event: WebhookDataEvent){
        this.logger.log("handling webhook data event");
        Promise.resolve(event.command.parseData(event.data)).then(d => {
            const s = SendSlackEvent.transferEvent(event)
            this.eventBus.publish(s)
        })
    }

}