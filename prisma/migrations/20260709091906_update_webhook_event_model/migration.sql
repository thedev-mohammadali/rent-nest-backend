-- AlterTable
ALTER TABLE "stripe_webhook_events" ADD COLUMN     "error_message" TEXT,
ALTER COLUMN "processed_at" DROP NOT NULL,
ALTER COLUMN "processed_at" DROP DEFAULT;
