import { Injectable } from "@nestjs/common";
import { ICommand, ofType, Saga } from "@nestjs/cqrs";
import {  map, Observable } from "rxjs";
import { APIAlertCommand } from "../commands/interface/api-alert.command";
import { APIErrorEvent } from "../events/interface/api-error.event";

@Injectable()
export class EventHandlerSaga {

  @Saga()
  eventReceived = (events$: Observable<any>): Observable<ICommand> => {
    return events$
      .pipe(
        ofType(APIErrorEvent),
        map(event => {
          console.log('Inside [HeroesGameSagas] Saga: ', event);
          return new APIAlertCommand(17, {})
        }),
      );
  }
}