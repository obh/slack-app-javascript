import { FetchDataEventHandler } from "./handlers/fetch-data.handler";
import { SendSlackEventHandler } from "./handlers/send-slack.handler";
import { WebhookDataEventHandler } from "./handlers/webhook-data.handler";

export const EventHandlers = [FetchDataEventHandler, SendSlackEventHandler, WebhookDataEventHandler];
