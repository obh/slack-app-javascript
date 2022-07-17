import { APIAlertCommand } from "./api-alert.command";
import { ICommonCommand } from "./common.command";

//This is just interface to save all commands

export const CommandList:ICommonCommand[] = [new APIAlertCommand]

export function parseSubscribeCommand(command: string): boolean | ICommonCommand{
    const cmdFound = CommandList.filter(c => (c.eventId === command && c.canSubscribe))
    if(!cmdFound){
        return false;
    }
    if(cmdFound.length > 1){
        throw new Error("duplicate commands found. Stopping here!")
    }
    return cmdFound[0];
}

//TODO complete this
export function parseFetchCommand(command: string): boolean | ICommonCommand{
    const cmdFound = CommandList.filter(c => c.eventId === command && c.canFetch)
    if(!cmdFound){
        return false;
    }
    if(cmdFound.length > 1){
        throw new Error("duplicate commands found. Stopping here!")
    }
    return cmdFound[0];
}