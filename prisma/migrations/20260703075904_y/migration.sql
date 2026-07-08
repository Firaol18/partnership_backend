/*
  Warnings:

  - You are about to drop the column `approved_by` on the `agreement_amendments` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `agreement_amendments` table. All the data in the column will be lost.
  - The `changed_clauses` column on the `agreement_amendments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `amendments` on the `agreements` table. All the data in the column will be lost.
  - You are about to drop the column `approved_by` on the `agreements` table. All the data in the column will be lost.
  - You are about to drop the column `approved_status` on the `agreements` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `agreements` table. All the data in the column will be lost.
  - You are about to drop the column `draft_versions` on the `agreements` table. All the data in the column will be lost.
  - You are about to drop the column `legal_reviewed_by` on the `agreements` table. All the data in the column will be lost.
  - You are about to drop the column `reviewed_by` on the `agreements` table. All the data in the column will be lost.
  - You are about to drop the column `verified_by` on the `agreements` table. All the data in the column will be lost.
  - You are about to drop the column `rejection_reason` on the `collaborations` table. All the data in the column will be lost.
  - You are about to alter the column `ipAddress` on the `user_activity_logs` table. The data in that column could be lost. The data in that column will be cast from `Inet` to `Unsupported("inet")`.
  - A unique constraint covering the columns `[agreement_id,document_id]` on the table `agreement_documents` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[entity_type,entity_id,document_id]` on the table `collaboration_documents` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[partner_id,user_id]` on the table `internal_focal_persons` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[partner_id]` on the table `partners` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `created_by_id` to the `agreement_amendments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_by_id` to the `agreements` table without a default value. This is not possible if the table is not empty.
  - Made the column `opportunity_id` on table `agreements` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `signatories` on the `agreements` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `partner_id` to the `partners` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `registration_path` on the `partners` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "agreements" DROP CONSTRAINT "agreements_created_by_fkey";

-- DropIndex
DROP INDEX "idx_collaborations_creator";

-- AlterTable
ALTER TABLE "activity_approval_history" ALTER COLUMN "action_date" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "agreement_amendments" DROP COLUMN "approved_by",
DROP COLUMN "created_by",
ADD COLUMN     "approved_by_id" UUID,
ADD COLUMN     "created_by_id" UUID NOT NULL,
DROP COLUMN "changed_clauses",
ADD COLUMN     "changed_clauses" JSONB;

-- AlterTable
ALTER TABLE "agreements" DROP COLUMN "amendments",
DROP COLUMN "approved_by",
DROP COLUMN "approved_status",
DROP COLUMN "created_by",
DROP COLUMN "draft_versions",
DROP COLUMN "legal_reviewed_by",
DROP COLUMN "reviewed_by",
DROP COLUMN "verified_by",
ADD COLUMN     "approved_by_id" UUID,
ADD COLUMN     "created_by_id" UUID NOT NULL,
ADD COLUMN     "legal_reviewed_by_id" UUID,
ADD COLUMN     "reviewed_by_id" UUID,
ADD COLUMN     "termination_note" TEXT,
ADD COLUMN     "verified_by_id" UUID,
ALTER COLUMN "opportunity_id" SET NOT NULL,
DROP COLUMN "signatories",
ADD COLUMN     "signatories" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "collaborations" DROP COLUMN "rejection_reason";

-- AlterTable
ALTER TABLE "partners" ADD COLUMN     "partner_id" VARCHAR(50) NOT NULL,
DROP COLUMN "registration_path",
ADD COLUMN     "registration_path" VARCHAR(10) NOT NULL;

-- AlterTable
ALTER TABLE "projects" ALTER COLUMN "percentage_completion" DROP NOT NULL;

-- AlterTable
ALTER TABLE "user_activity_logs" ALTER COLUMN "ipAddress" SET DATA TYPE inet;

-- DropEnum
DROP TYPE "RegistrationPath";

-- CreateIndex
CREATE INDEX "idx_act_approval_entity" ON "activity_approval_history"("entity_type", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_agr_doc_unique" ON "agreement_documents"("agreement_id", "document_id");

-- CreateIndex
CREATE INDEX "idx_collab_doc_entity" ON "collaboration_documents"("entity_type", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_collab_doc_unique" ON "collaboration_documents"("entity_type", "entity_id", "document_id");

-- CreateIndex
CREATE INDEX "idx_focal_user" ON "internal_focal_persons"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_focal_unique" ON "internal_focal_persons"("partner_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "partners_partner_id_key" ON "partners"("partner_id");

-- CreateIndex
CREATE INDEX "idx_partners_registration_path" ON "partners"("registration_path");

-- AddForeignKey
ALTER TABLE "agreements" ADD CONSTRAINT "agreements_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "partner_opportunities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agreements" ADD CONSTRAINT "agreements_engagement_id_fkey" FOREIGN KEY ("engagement_id") REFERENCES "engagements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agreements" ADD CONSTRAINT "agreements_legal_reviewed_by_id_fkey" FOREIGN KEY ("legal_reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agreements" ADD CONSTRAINT "agreements_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agreements" ADD CONSTRAINT "agreements_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agreements" ADD CONSTRAINT "agreements_verified_by_id_fkey" FOREIGN KEY ("verified_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agreements" ADD CONSTRAINT "agreements_previous_version_id_fkey" FOREIGN KEY ("previous_version_id") REFERENCES "agreements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agreements" ADD CONSTRAINT "agreements_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agreement_documents" ADD CONSTRAINT "agreement_documents_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agreement_amendments" ADD CONSTRAINT "agreement_amendments_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agreement_amendments" ADD CONSTRAINT "agreement_amendments_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agreement_amendments" ADD CONSTRAINT "agreement_amendments_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agreement_review_history" ADD CONSTRAINT "agreement_review_history_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partners" ADD CONSTRAINT "partners_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "partner_opportunities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partners" ADD CONSTRAINT "partners_engagement_id_fkey" FOREIGN KEY ("engagement_id") REFERENCES "engagements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partners" ADD CONSTRAINT "partners_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partners" ADD CONSTRAINT "partners_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_contacts" ADD CONSTRAINT "partner_contacts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "joint_activities" ADD CONSTRAINT "joint_activities_lead_organization_id_fkey" FOREIGN KEY ("lead_organization_id") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "joint_activities" ADD CONSTRAINT "joint_activities_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "joint_activities" ADD CONSTRAINT "joint_activities_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "joint_activities" ADD CONSTRAINT "joint_activities_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "joint_activities" ADD CONSTRAINT "joint_activities_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_deliverables" ADD CONSTRAINT "project_deliverables_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_risks" ADD CONSTRAINT "project_risks_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_contributions" ADD CONSTRAINT "resource_contributions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_contributions" ADD CONSTRAINT "resource_contributions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funding_grants" ADD CONSTRAINT "funding_grants_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funding_grants" ADD CONSTRAINT "funding_grants_resource_contribution_id_fkey" FOREIGN KEY ("resource_contribution_id") REFERENCES "resource_contributions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funding_grants" ADD CONSTRAINT "funding_grants_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collaboration_documents" ADD CONSTRAINT "collaboration_documents_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_approval_history" ADD CONSTRAINT "activity_approval_history_action_by_fkey" FOREIGN KEY ("action_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
