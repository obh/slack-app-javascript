import { EventBus, EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { FetchDataEvent } from "../interface/fetch-data.event";
import { SendSlackEvent } from "../interface/send-slack.event";

  
@EventsHandler(FetchDataEvent)
export class FetchDataEventHandler implements IEventHandler<FetchDataEvent>{

    constructor(private eventBus: EventBus){        
    }

    handle(event: FetchDataEvent){        
        console.log("handling fetch data event");
        try {
            console.log("fetching data in event handler")
            Promise.resolve(event.command.fetchData()).then(d => {
                const s = SendSlackEvent.transferEvent(event)
                this.eventBus.publish(s)
            })
        } catch (error) {
            console.log(error);
        }
    }

}