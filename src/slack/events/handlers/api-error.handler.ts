import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { APIErrorEvent } from "../interface/api-error.event";
import axios from "axios";

@EventsHandler(APIErrorEvent)
export class APIErrorEventHandler implements IEventHandler<APIErrorEvent>{
    
    async handle(event: APIErrorEvent){
        console.log("handling api error event in Handler");
        console.log("***event handling completed***");
        const data = await this.fetch()
        console.log('fetched data in event:', data)
    }

    async fetch(){
        try {
            const data = await axios.get("https://random-data-api.com/api/stripe/random_stripe");
            return data;
          } catch(err) {
            console.log("error: ", err);
          }
    }

}