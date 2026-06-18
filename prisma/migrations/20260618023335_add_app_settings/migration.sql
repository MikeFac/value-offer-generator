-- DropIndex
DROP INDEX "sms_logs_user_id_idx";

-- CreateTable
CREATE TABLE "app_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "model" TEXT NOT NULL DEFAULT 'gpt-4o-mini',

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);
