import { SlackInstallation } from "@prisma/client";
import { SlashCommand } from "@slack/bolt";

export interface ICommonCommand {
    readonly eventId: string;
    readonly eventDescription: string;
    readonly slashCommand: SlashCommand;
    readonly slackInstallation: SlackInstallation;

    canSubscribe (): boolean;
    canFetch (): boolean;
    validate (slackInstallation: SlackInstallation): boolean;    
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