import { SlackEventSubscription, SlackInstallation } from "@prisma/client" 
import { SlackInstallationDto } from "src/entity/slack/slack-installation.entity";
import { WebClient, LogLevel, View, Block } from "@slack/web-api";
import { SlashCommand } from "@slack/bolt";

// export function SlackInstallationToEntity(slackAppInstallation: SlackInstallation): SlackInstallationDto {
//     let slackEntity: SlackInstallationDto;
//     slackEntity.appId = slackAppInstallation.appId;
//     slackEntity.botId = slackAppInstallation.botId;
//     slackEntity.id = slackAppInstallation.id;
//     slackEntity.merchantId = slackAppInstallation.merchantId;
//     slackEntity.installedOn = slackAppInstallation.installedAt;
//     //slackEntity.status = slackAppInstallation.
//     return slackEntity;
// }

export enum SlackInstallationStatus {
  ACTIVE = 'ACTIVE',
  DEACTIVATED = 'DEACTIVATED',
}

export enum SlackSubscriptionStatus {
  SUBSCRIBED = 'SUBSCRIBED',
  UNSUBSCRIBED = 'UNSUBSCRIBED'
}

export async function PostToSlack(message: Block[], botToken: string, channelId: string){
    console.log("Posting to slack channel: {}, data: {}", channelId, message)
    try {
        const client = new WebClient(botToken, {
            logLevel: LogLevel.DEBUG
          });
        const result = await client.chat.postMessage({
          channel: channelId,
          blocks: message,
        });
        console.log(result);
      } catch (error) {
        console.log(error)
      }
}

export async function PostHomeViewToSlack(data: View, botToken: string, channelId: string){
  console.log("Posting HomeView to slack channel: {}, data: {}", channelId, data)
  try {
      const client = new WebClient(botToken, {
          logLevel: LogLevel.DEBUG
        });
      const result = await client.views.publish({
        user_id: "U03MJ0MD01X",
        view: data,
      });
      console.log(result);
    } catch (error) {
      console.log(error)
    }
}

export function prepareSlashCommandForSubscription(eventSubscription: SlackEventSubscription): SlashCommand{
  const slashCmd = {
      user_id: eventSubscription.userId,
      user_name: eventSubscription.userName,
      channel_id: eventSubscription.channelId,
      channel_name: eventSubscription.channelName,
      api_app_id: eventSubscription.appId,
  }
  return slashCmd as SlashCommand
}