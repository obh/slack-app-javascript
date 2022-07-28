import { copyFile } from "fs";
import { SEvent } from "./fetch-data.event";

export class SendSlackEvent extends SEvent {
    static transferEvent(event: SEvent){
        const s = new SendSlackEvent(event.eventId, event.command)
        return s
    }
}