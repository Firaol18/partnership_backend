/*
  Warnings:

  - You are about to alter the column `ipAddress` on the `user_activity_logs` table. The data in that column could be lost. The data in that column will be cast from `Inet` to `Unsupported("inet")`.
  - You are about to drop the column `purpose_of_visit_id` on the `visits` table. All the data in the column will be lost.
  - You are about to drop the column `purpose_other` on the `visits` table. All the data in the column will be lost.
  - You are about to drop the `visit_purposes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "visits" DROP CONSTRAINT "visits_purpose_of_visit_id_fkey";

-- AlterTable
ALTER TABLE "user_activity_logs" ALTER COLUMN "ipAddress" SET DATA TYPE inet;

-- AlterTable
ALTER TABLE "visits" DROP COLUMN "purpose_of_visit_id",
DROP COLUMN "purpose_other",
ADD COLUMN     "purpose" TEXT;

-- DropTable
DROP TABLE "visit_purposes";
