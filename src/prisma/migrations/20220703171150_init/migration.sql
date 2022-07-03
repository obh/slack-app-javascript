-- CreateTable
CREATE TABLE "slack_app_installation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "client_id" TEXT,
    "app_id" TEXT,
    "enterprise_id" TEXT,
    "enterprise_name" TEXT,
    "enterprise_url" TEXT,
    "team_id" TEXT,
    "team_name" TEXT,
    "bot_token" TEXT,
    "bot_id" TEXT,
    "bot_user_id" TEXT,
    "bot_scopes" TEXT,
    "bot_refresh_token" TEXT,
    "bot_token_expires_at" DATETIME,
    "user_id" TEXT,
    "user_token" TEXT,
    "user_scopes" TEXT,
    "user_refresh_token" TEXT,
    "user_token_expires_at" DATETIME,
    "incoming_webhook_url" TEXT,
    "incoming_webhook_channel" TEXT,
    "incoming_webhook_channel_id" TEXT,
    "incoming_webhook_configuration_url" TEXT,
    "is_enterprise_install" BOOLEAN NOT NULL DEFAULT false,
    "token_type" TEXT NOT NULL DEFAULT 'bot',
    "installed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "merchantId" INTEGER NOT NULL
);
