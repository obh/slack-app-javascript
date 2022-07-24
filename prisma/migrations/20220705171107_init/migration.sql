-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_slack_app_installation" (
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
    "installationStatus" TEXT NOT NULL DEFAULT 'INACTIVE',
    "merchantId" INTEGER
);
INSERT INTO "new_slack_app_installation" ("app_id", "bot_id", "bot_refresh_token", "bot_scopes", "bot_token", "bot_token_expires_at", "bot_user_id", "client_id", "enterprise_id", "enterprise_name", "enterprise_url", "id", "incoming_webhook_channel", "incoming_webhook_channel_id", "incoming_webhook_configuration_url", "incoming_webhook_url", "installed_at", "is_enterprise_install", "merchantId", "team_id", "team_name", "token_type", "user_id", "user_refresh_token", "user_scopes", "user_token", "user_token_expires_at") SELECT "app_id", "bot_id", "bot_refresh_token", "bot_scopes", "bot_token", "bot_token_expires_at", "bot_user_id", "client_id", "enterprise_id", "enterprise_name", "enterprise_url", "id", "incoming_webhook_channel", "incoming_webhook_channel_id", "incoming_webhook_configuration_url", "incoming_webhook_url", "installed_at", "is_enterprise_install", "merchantId", "team_id", "team_name", "token_type", "user_id", "user_refresh_token", "user_scopes", "user_token", "user_token_expires_at" FROM "slack_app_installation";
DROP TABLE "slack_app_installation";
ALTER TABLE "new_slack_app_installation" RENAME TO "slack_app_installation";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
