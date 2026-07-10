/*
  Warnings:

  - You are about to drop the column `message` on the `rental_requests` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "rental_requests" DROP COLUMN "message",
ADD COLUMN     "tenant_message" TEXT;

-- CreateIndex
CREATE INDEX "rental_requests_tenant_id_idx" ON "rental_requests"("tenant_id");
