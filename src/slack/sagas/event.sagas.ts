import { Injectable } from "@nestjs/common";
import { ofType, Saga } from "@nestjs/cqrs";
import { map, Observable } from "rxjs";
import { ICommonCommand } from "../commands/common.command";
import { SendSlackEvent } from "../events/interface/send-slack.event";

@Injectable()
export class EventHandlerSaga {

  @Saga()
  eventReceived = (events$: Observable<any>): Observable<ICommonCommand> => {
    return events$
      .pipe(
        ofType(SendSlackEvent),
        map(event => {
          let command;
          if(event.eventId == 'api-alert') {
            command = event.command
          }          
          return command
        }),
      )
  }
  
}