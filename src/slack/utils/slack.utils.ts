import { SlackInstallation } from "@prisma/client" 
import { SlackInstallationDto } from "src/entity/slack/slack-installation.entity";

export function SlackInstallationToEntity(slackAppInstallation: SlackInstallation): SlackInstallationDto {
    let slackEntity: SlackInstallationDto;
    slackEntity.appId = slackAppInstallation.app_id;
    slackEntity.botId = slackAppInstallation.bot_id;
    slackEntity.id = slackAppInstallation.id;
    slackEntity.merchantId = slackAppInstallation.merchant_id;
    slackEntity.installedOn = slackAppInstallation.installed_at;
    //slackEntity.status = slackAppInstallation.
    return slackEntity;
}

export enum SlackInstallationStatus {
    ACTIVE = 'ACTIVE',
    DEACTIVATED = 'DEACTIVATED',
}