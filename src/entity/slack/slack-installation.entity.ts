export interface SlackInstallationDto {
    id: number;
    merchantId: number;
    appId: string;
    teamId: string;
    botId: string;
    userId: string;
    status: string;
    installedOn: Date;
}