import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { SlackEventSubscription, SlackInstallation } from "@prisma/client";
import { ICommonCommand } from "../commands/common.command";
import { SlackInstallationStatus, SlackSubscriptionStatus } from "../utils/slack.utils";

@Injectable()
export class SlackPrismaService {
    private prismaClient: PrismaClient;
    
    constructor(){
        this.prismaClient = new PrismaClient({
            log: [
                {
                    emit: 'stdout',
                    level: 'query',
                },
            ],
        });
    }

    public async fetchSubscription(subscriptionEvent: ICommonCommand, appId: string): Promise<SlackEventSubscription>{
        return await this.prismaClient.slackEventSubscription.findFirst({
            where: {
                AND: [
                    {event: subscriptionEvent.eventId},
                    {appId: appId},
                ]
            }
        });
    }

    public async fetchActiveInstallation(appId: string): Promise<SlackInstallation>{
        return await this.prismaClient.slackInstallation.findFirst({
            where: {
                AND: [
                    {appId: appId},
                    {installationStatus: SlackInstallationStatus.ACTIVE}
                ]
            }
        });
    }

    public async fetchActiveInstallationforMerchant(merchantId: number): Promise<SlackInstallation>{
        return await this.prismaClient.slackInstallation.findFirst({
            where: {
                AND: [
                    {merchantId: merchantId},
                    {installationStatus: SlackInstallationStatus.ACTIVE}
                ]
            }
        });
    }

    public async fetchActiveSubscriptionForMerchant(merchantId: number, event: string): Promise<SlackEventSubscription>{
        return await this.prismaClient.slackEventSubscription.findFirst({
            where: {
                AND: [
                    {merchantId: merchantId},
                    {eventStatus: SlackSubscriptionStatus.SUBSCRIBED},
                    {event: event}    
                ]
            }
        });
    }

    public async disableInstallation(installId: number): Promise<SlackInstallation>{
        if(!installId || installId <= 0){
            throw new Error("Invalid installation id");
        }
        return await this.prismaClient.slackInstallation.update({
            where: {
                id: installId
            },
            data: {
                installationStatus: SlackInstallationStatus.DEACTIVATED
            }
        });
    }
}

