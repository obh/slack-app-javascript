import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { SendSlackEvent } from "../interface/send-slack.event";

@EventsHandler(SendSlackEvent)
export class SendSlackEventHandler implements IEventHandler<SendSlackEvent>{
    constructor(){
    }

    handle(event: SendSlackEvent){        
        console.log("sending event to slack");
    }
}
