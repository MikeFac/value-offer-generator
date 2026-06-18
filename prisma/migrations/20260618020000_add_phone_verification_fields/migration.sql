-- AlterTable
ALTER TABLE "users" ADD COLUMN "phone_verification_code" TEXT;
ALTER TABLE "users" ADD COLUMN "phone_verification_expiry" TIMESTAMP(3);