/*
  Warnings:

  - The `session_expires_at` column on the `payments` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "payments" DROP COLUMN "session_expires_at",
ADD COLUMN     "session_expires_at" INTEGER;
