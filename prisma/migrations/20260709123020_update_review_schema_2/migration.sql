/*
  Warnings:

  - You are about to drop the column `submited_by` on the `reviews` table. All the data in the column will be lost.
  - Added the required column `tenant_id` to the `reviews` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "reviews" DROP COLUMN "submited_by",
ADD COLUMN     "tenant_id" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
