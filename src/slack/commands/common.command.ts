import { SlackInstallation } from "@prisma/client";
import { SlashCommand } from "@slack/bolt";

export interface ICommonCommand {
    // These are the static things which belong to the command
    readonly eventId: string;
    readonly eventDescription: string;

    // The following are properties of the slack installation and the slack command
    slashCommand: SlashCommand;
    slackInstallation: SlackInstallation;

    // The following is the property of the data which will be posted to slack
    data: object;

    canSubscribe (): boolean;
    canFetch (): boolean;    
    fetchData(): any;
    parseData(data: any): any;
}



export namespace ICommandControlPanel {
    type Constructor<T> = {
      new(...args: any[]): T;
      readonly prototype: T;
    }
    const implementations: Constructor<ICommonCommand>[] = [];
    export function GetImplementations(): Constructor<ICommonCommand>[] {
      return implementations;
    }
    export function register<T extends Constructor<ICommonCommand>>(ctor: T) {
      implementations.push(ctor);
      return ctor;
    }
  }