import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { APIErrorEvent } from "../interface/api-error.event";

@EventsHandler(APIErrorEvent)
export class APIErrorEventHandler implements IEventHandler<APIErrorEvent>{
    
    handle(event: APIErrorEvent){
        console.log("handling api error event in Handler");
        console.log("***event handling completed***");
    }

}