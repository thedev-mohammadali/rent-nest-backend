/*
  Warnings:

  - The values [ACTIVE,COMPLETED] on the enum `RentalRequestStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "RentalStatus" AS ENUM ('NOT_STARTED', 'ACTIVE', 'COMPLETED', 'TERMINATED');

-- AlterEnum
BEGIN;
CREATE TYPE "RentalRequestStatus_new" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
ALTER TABLE "public"."rental_requests" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "rental_requests" ALTER COLUMN "status" TYPE "RentalRequestStatus_new" USING ("status"::text::"RentalRequestStatus_new");
ALTER TYPE "RentalRequestStatus" RENAME TO "RentalRequestStatus_old";
ALTER TYPE "RentalRequestStatus_new" RENAME TO "RentalRequestStatus";
DROP TYPE "public"."RentalRequestStatus_old";
ALTER TABLE "rental_requests" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropIndex
DROP INDEX "rental_requests_tenant_id_property_id_key";

-- AlterTable
ALTER TABLE "rental_requests" ADD COLUMN     "rental_status" "RentalStatus" NOT NULL DEFAULT 'NOT_STARTED';
