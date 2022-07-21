import { APIAlertCommand } from "./api-alert.command";
import { ICommandControlPanel, ICommonCommand } from "./common.command";

//This is just interface to save all commands

export const commandList = ICommandControlPanel.GetImplementations();

export function parseSubscribeCommand(command: string): ICommonCommand {
    for(let i = 0; i < commandList.length; i++){
        let c = new commandList[i]();
        if(c.canSubscribe() && c.eventId == command){
            return c
        }
    }
    return null;
}

//TODO complete this
export function parseFetchCommand(command: string): ICommonCommand {
    for(let i = 0; i < commandList.length; i++){
        let c = new commandList[i]();
        if(c.canFetch() && c.eventId == command){
            return c
        }
    }
    return null;
}