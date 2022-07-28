import { SlashCommand } from "@slack/bolt";
import { SlackInstallation } from "@prisma/client";
import { ICommonCommand } from "src/slack/commands/common.command";

export class SEvent {
  // slackInstall: SlackInstallation;
  // slashCommand: SlashCommand;
  eventId: string;
  command: ICommonCommand;

  constructor(eventId: string, command: ICommonCommand){
    this.eventId = eventId;
    this.command = command;
  }

  // setSlackInstall(slackInstall: SlackInstallation){
  //   this.slackInstall = slackInstall;
  // }

  // setSlashCommand(slashCmd: SlashCommand){
  //   this.slashCommand = slashCmd
  // }

  setCommand(command: ICommonCommand){
    this.command = command
  }
}

export class FetchDataEvent extends SEvent {}