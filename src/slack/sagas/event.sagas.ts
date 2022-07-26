import { Injectable } from "@nestjs/common";
import { ICommand, ofType, Saga } from "@nestjs/cqrs";
import { map, Observable } from "rxjs";
import { APIAlertCommand } from "../commands/api-alert.command";
import { ICommonCommand } from "../commands/common.command";
import { SendSlackEvent } from "../events/interface/send-slack.event";
import { WebhookDataEvent } from "../events/interface/webhook-data.event";

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
            command = new APIAlertCommand(event.slashCommand, event.slackInstall)            
          }          
          return command
        }),
      )
  }

  @Saga()
  eventReceived2 = (events$: Observable<any>): Observable<ICommonCommand> => {
    return events$
      .pipe(
        ofType(WebhookDataEvent),
        map(event => {
          if(event.eventId == 'api-alert') {
            const apiAlertCommand = new APIAlertCommand(event.slashCommand, event.slackInstall)
            // apiAlertCommand.parseData(event.data)
            return apiAlertCommand
          }           
        }),
      )
  }
}