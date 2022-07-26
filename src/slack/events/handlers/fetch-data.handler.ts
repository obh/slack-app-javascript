import { EventBus, EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { FetchDataEvent } from "../interface/fetch-data.event";

  
@EventsHandler(FetchDataEvent)
export class FetchDataEventHandler implements IEventHandler<FetchDataEvent>{

    constructor(private eventBus: EventBus){
        console.log("what say?")
        console.log(this.eventBus == undefined)
    }

    handle(event: FetchDataEvent){        
        console.log("handling fetch data event");
        try {
            console.log("fetching data in event handler")
            event.command.fetchData()
            console.log(this.eventBus == undefined)
                console.log(">>>>> COMPLETED")
            throw new Error("failed")
            //resolve(event);
        } catch (error) {
            console.log(error);
        }
    }

}