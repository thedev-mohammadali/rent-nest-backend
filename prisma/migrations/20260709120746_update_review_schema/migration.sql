/*
  Warnings:

  - You are about to drop the column `rental_request_id` on the `reviews` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[rental_agreement_id]` on the table `reviews` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `rental_agreement_id` to the `reviews` table without a default value. This is not possible if the table is not empty.
  - Added the required column `submited_by` to the `reviews` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_rental_request_id_fkey";

-- DropIndex
DROP INDEX "reviews_rental_request_id_key";

-- AlterTable
ALTER TABLE "reviews" DROP COLUMN "rental_request_id",
ADD COLUMN     "rental_agreement_id" UUID NOT NULL,
ADD COLUMN     "submited_by" VARCHAR(200) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "reviews_rental_agreement_id_key" ON "reviews"("rental_agreement_id");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_rental_agreement_id_fkey" FOREIGN KEY ("rental_agreement_id") REFERENCES "rental_agreements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
