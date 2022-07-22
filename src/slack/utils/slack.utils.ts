import { SlackInstallation } from "@prisma/client" 
import { SlackInstallationDto } from "src/entity/slack/slack-installation.entity";
import { WebClient, LogLevel } from "@slack/web-api";

export function SlackInstallationToEntity(slackAppInstallation: SlackInstallation): SlackInstallationDto {
    let slackEntity: SlackInstallationDto;
    slackEntity.appId = slackAppInstallation.appId;
    slackEntity.botId = slackAppInstallation.botId;
    slackEntity.id = slackAppInstallation.id;
    slackEntity.merchantId = slackAppInstallation.merchantId;
    slackEntity.installedOn = slackAppInstallation.installedAt;
    //slackEntity.status = slackAppInstallation.
    return slackEntity;
}

export enum SlackInstallationStatus {
    ACTIVE = 'ACTIVE',
    DEACTIVATED = 'DEACTIVATED',
}

export async function PostToSlack(message: object, botToken: string, channelId: string){
    console.log("Posting to slack channel: {}, data: {}", channelId, message)
    try {
        const client = new WebClient(botToken, {
            logLevel: LogLevel.DEBUG
          });
        const result = await client.chat.postMessage({
          channel: channelId,
          view: message,
        });
        console.log(result);
      } catch (error) {
        console.log(error)
      }
}