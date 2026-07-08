/*
  Warnings:

  - You are about to drop the column `type` on the `payments` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "payments" DROP COLUMN "type",
ADD COLUMN     "checkout_url" TEXT,
ADD COLUMN     "failure_reason" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL,
ALTER COLUMN "currency" SET DEFAULT 'usd';
