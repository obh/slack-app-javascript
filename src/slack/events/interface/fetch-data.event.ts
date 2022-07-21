import { SlashCommand } from "@slack/bolt";
import { SlackInstallation } from "@prisma/client";

export interface SEvent {
  readonly slackInstall: SlackInstallation;
  readonly slashCommand: SlashCommand;
  readonly eventId: string;
}

export class FetchDataEvent implements SEvent {
   slackInstall: SlackInstallation;
   slashCommand: SlashCommand;
   eventId: string;
   
   constructor(eventId: string){
     this.eventId = eventId
   }

    setSlackInstall(slackInstall: SlackInstallation){
      this.slackInstall = slackInstall;
    }

    setSlashCommand(slashCmd: SlashCommand){
      this.slashCommand = slashCmd
    }
  }