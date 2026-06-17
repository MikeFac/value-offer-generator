-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "anonymous_id" TEXT,
ADD COLUMN     "message_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "model" TEXT NOT NULL DEFAULT 'gpt-4o-mini',
ALTER COLUMN "user_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "stripe_customer_id" TEXT,
ADD COLUMN     "stripe_subscription_id" TEXT,
ADD COLUMN     "tier" TEXT NOT NULL DEFAULT 'free';

-- CreateTable
CREATE TABLE "monthly_usages" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "anonymous_id" TEXT,
    "month" INTEGER NOT NULL,
    "session_count" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "monthly_usages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "monthly_usages_user_id_month_key" ON "monthly_usages"("user_id", "month");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_usages_anonymous_id_month_key" ON "monthly_usages"("anonymous_id", "month");

-- AddForeignKey
ALTER TABLE "monthly_usages" ADD CONSTRAINT "monthly_usages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
