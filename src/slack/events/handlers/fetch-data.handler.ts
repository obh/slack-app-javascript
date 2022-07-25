import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { FetchDataEvent } from "../interface/fetch-data.event";

@EventsHandler(FetchDataEvent)
export class FetchDataEventHandler implements IEventHandler<FetchDataEvent>{
    
    async handle(event: FetchDataEvent){
        console.log("handling fetch data event");

    }

}