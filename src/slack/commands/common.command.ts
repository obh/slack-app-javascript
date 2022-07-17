import { SlackInstallation } from "@prisma/client";

export interface ICommonCommand {
    readonly eventId: string;
    readonly eventDescription: string;
    canSubscribe (): boolean;
    canFetch (): boolean;
    validate (slackInstallation: SlackInstallation): boolean;    
}