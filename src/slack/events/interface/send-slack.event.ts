import { copyFile } from "fs";
import { SEvent } from "./fetch-data.event";

export class SendSlackEvent extends SEvent {
    static transferEvent(event: SEvent){
        const s = new SendSlackEvent(event.eventId)
        //s.setSlashCommand(event.slashCommand)
        //s.setSlackInstall(event.slackInstall)
        s.setCommand(event.command)
        return s
    }
}