/*
  Warnings:

  - You are about to drop the column `rental_request_id` on the `payments` table. All the data in the column will be lost.
  - You are about to alter the column `currency` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to drop the column `lease_end_date` on the `rental_requests` table. All the data in the column will be lost.
  - You are about to drop the column `lease_start_date` on the `rental_requests` table. All the data in the column will be lost.
  - You are about to drop the column `monthly_rent` on the `rental_requests` table. All the data in the column will be lost.
  - You are about to drop the column `rental_status` on the `rental_requests` table. All the data in the column will be lost.
  - Added the required column `rental_agreement_id` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RentalAgreementStatus" AS ENUM ('PENDING_PAYMENT', 'ACTIVE', 'COMPLETED', 'TERMINATED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_rental_request_id_fkey";

-- DropIndex
DROP INDEX "payments_rental_request_id_idx";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "rental_request_id",
ADD COLUMN     "rental_agreement_id" UUID NOT NULL,
ALTER COLUMN "currency" SET DATA TYPE VARCHAR(20);

-- AlterTable
ALTER TABLE "rental_requests" DROP COLUMN "lease_end_date",
DROP COLUMN "lease_start_date",
DROP COLUMN "monthly_rent",
DROP COLUMN "rental_status";

-- DropEnum
DROP TYPE "PaymentType";

-- CreateTable
CREATE TABLE "rental_agreements" (
    "id" UUID NOT NULL,
    "rental_request_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "monthly_rent" DECIMAL(10,2) NOT NULL,
    "duration_in_months" INTEGER NOT NULL,
    "lease_start_date" DATE NOT NULL,
    "lease_end_date" DATE NOT NULL,
    "status" "RentalAgreementStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "activated_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "rental_agreements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rental_agreements_rental_request_id_key" ON "rental_agreements"("rental_request_id");

-- CreateIndex
CREATE INDEX "rental_agreements_tenant_id_idx" ON "rental_agreements"("tenant_id");

-- CreateIndex
CREATE INDEX "rental_agreements_property_id_idx" ON "rental_agreements"("property_id");

-- CreateIndex
CREATE INDEX "payments_rental_agreement_id_idx" ON "payments"("rental_agreement_id");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_rental_agreement_id_fkey" FOREIGN KEY ("rental_agreement_id") REFERENCES "rental_agreements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_agreements" ADD CONSTRAINT "rental_agreements_rental_request_id_fkey" FOREIGN KEY ("rental_request_id") REFERENCES "rental_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_agreements" ADD CONSTRAINT "rental_agreements_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_agreements" ADD CONSTRAINT "rental_agreements_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
