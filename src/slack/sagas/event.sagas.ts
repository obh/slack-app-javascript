import { Injectable } from "@nestjs/common";
import { ICommand, ofType, Saga } from "@nestjs/cqrs";
import { map, Observable } from "rxjs";
import { APIAlertCommand } from "../commands/api-alert.command";
import { ICommonCommand } from "../commands/common.command";
import { FetchDataEvent } from "../events/interface/fetch-data.event";

@Injectable()
export class EventHandlerSaga {

  @Saga()
  eventReceived = (events$: Observable<any>): Observable<ICommonCommand> => {
    return events$
      .pipe(
        ofType(FetchDataEvent),
        map(event => {
          if(event.eventId == 'api-alert') {
            return new APIAlertCommand(event.slashCommand, event.slackInstall)
          }
          // return new APIAlertCommand(17, {})
        }),
      );
  }
}