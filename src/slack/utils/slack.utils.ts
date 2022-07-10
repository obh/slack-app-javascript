import { SlackInstallation } from "@prisma/client" 
import { SlackInstallationDto } from "src/entity/slack/slack-installation.entity";

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