import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { APIAlertCommand } from "../api-alert.command";
import { WebClient, LogLevel, View, Block } from "@slack/web-api";
import { PostToSlack } from "src/slack/utils/slack.utils";
import { BlockList } from "net";

@CommandHandler(APIAlertCommand)
export class APIAlertCommandHandler implements ICommandHandler<APIAlertCommand> {
  constructor(
  ) {}

  async execute(command: APIAlertCommand) {
    console.log("API alert command", command);
    console.log("This is where we will send the message to slack")
    await PostToSlack(command.data.toSlackBlock(), command.slackInstallation.botToken, command.slashCommand.channel_id)    
    console.log("*****Command executed*****")
    // return Promise.resolve("hello")
  }

  
} 