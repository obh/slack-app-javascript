import { SlashCommand } from "@slack/bolt";
import { SlackInstallation } from "@prisma/client";

export class SEvent {
  slackInstall: SlackInstallation;
  slashCommand: SlashCommand;
  eventId: string;

  constructor(eventId: string){
    this.eventId = eventId;
  }

  setSlackInstall(slackInstall: SlackInstallation){
    this.slackInstall = slackInstall;
  }

  setSlashCommand(slashCmd: SlashCommand){
    this.slashCommand = slashCmd
  }


}

export class FetchDataEvent extends SEvent {}