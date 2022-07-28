import { Logger } from "@nestjs/common";
import { EventBus, EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { FetchDataEvent } from "../interface/fetch-data.event";
import { SendSlackEvent } from "../interface/send-slack.event";

  
@EventsHandler(FetchDataEvent)
export class FetchDataEventHandler implements IEventHandler<FetchDataEvent>{

    private readonly logger = new Logger(FetchDataEventHandler.name);

    constructor(private eventBus: EventBus){        
    }

    handle(event: FetchDataEvent){                
        try {
            this.logger.log("fetching data in event handler")
            Promise.resolve(event.command.fetchData()).then(d => {
                const s = SendSlackEvent.transferEvent(event)
                this.eventBus.publish(s)
            })
        } catch (error) {
            console.log(error);
        }
    }

}