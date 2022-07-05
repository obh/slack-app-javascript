import { SlackAppInstallation } from "@prisma/client";
import { SlackInstallation } from "src/entity/slack/slack-installation.entity";

export function SlackInstallationToEntity(slackAppInstallation: SlackAppInstallation): SlackInstallation {
    let slackEntity: SlackInstallation;
    slackEntity.appId = slackAppInstallation.appId;
    slackEntity.botId = slackAppInstallation.botId;
    slackEntity.id = slackAppInstallation.id;
    slackEntity.merchantId = slackAppInstallation.merchantId;
    slackEntity.installedOn = slackAppInstallation.installedAt;
    //slackEntity.status = slackAppInstallation.
    return slackEntity;
}

export enum SlackInstallationStatus {
    ACTIVE,
    DEACTIVATED,
}