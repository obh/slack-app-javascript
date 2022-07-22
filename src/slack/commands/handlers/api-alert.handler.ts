import { CommandHandler, EventBus, EventPublisher, ICommandHandler } from "@nestjs/cqrs";
import { APIAlertCommand } from "../api-alert.command";
import axios from "axios";
import { PostToSlack } from "src/slack/utils/slack.utils";

@CommandHandler(APIAlertCommand)
export class APIAlertCommandHandler implements ICommandHandler<APIAlertCommand> {
  constructor(
  ) {}

  async execute(command: APIAlertCommand) {
    console.log("API alert command", command);
    console.log("This is where we will send the message to slack")
    await command.fetchData()
    await PostToSlack(command.data, command.slackInstallation.botToken, command.slashCommand.channel_id)    
    console.log("*****Command executed*****")
    return Promise.resolve("hello")

  }

  async fetch(){
    try {
        const data = await axios.get("https://random-data-api.com/api/stripe/random_stripe");
        return data;
      } catch(err) {
        console.log("error: ", err);
      }
}
}