/*
  Warnings:

  - You are about to alter the column `ipAddress` on the `user_activity_logs` table. The data in that column could be lost. The data in that column will be cast from `Inet` to `Unsupported("inet")`.

*/
-- AlterTable
ALTER TABLE "user_activity_logs" ALTER COLUMN "ipAddress" SET DATA TYPE inet;

-- CreateTable
CREATE TABLE "opportunity_categories" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "opportunity_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strategic_importance_levels" (
    "id" UUID NOT NULL,
    "level_name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "strategic_importance_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opportunity_sources" (
    "id" UUID NOT NULL,
    "source_name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "opportunity_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_opportunities" (
    "id" UUID NOT NULL,
    "opportunity_uid" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "date_identified" DATE NOT NULL,
    "partner_id" UUID,
    "partner_name" VARCHAR(255) NOT NULL,
    "partner_acronym" VARCHAR(50),
    "organization_type" VARCHAR(100),
    "country" VARCHAR(100),
    "region" VARCHAR(100),
    "city" VARCHAR(100),
    "website" VARCHAR(255),
    "contact_person_name" VARCHAR(255),
    "contact_position" VARCHAR(255),
    "contact_email" VARCHAR(255),
    "contact_phone" VARCHAR(50),
    "existing_relationship" VARCHAR(50),
    "interest_area" TEXT,
    "strategic_importance_level_id" UUID,
    "opportunity_category_id" UUID,
    "opportunity_source_id" UUID,
    "opportunity_background" TEXT,
    "opportunity_description" TEXT,
    "proposed_collaboration_area" TEXT,
    "expected_outcome" TEXT,
    "strategic_alignment" TEXT,
    "expected_benefits" TEXT,
    "verification_notes" TEXT,
    "review_notes" TEXT,
    "approval_notes" TEXT,
    "screened_at" TIMESTAMP(3),
    "verified_at" TIMESTAMP(3),
    "reviewed_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "created_by" UUID NOT NULL,
    "reviewed_by" UUID,
    "verified_by" UUID,
    "status" VARCHAR(50) NOT NULL DEFAULT 'Draft',
    "converted_to_entity_type" VARCHAR(50),
    "converted_to_entity_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "userId" UUID,

    CONSTRAINT "partner_opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "opportunity_categories_name_key" ON "opportunity_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "strategic_importance_levels_level_name_key" ON "strategic_importance_levels"("level_name");

-- CreateIndex
CREATE UNIQUE INDEX "opportunity_sources_source_name_key" ON "opportunity_sources"("source_name");

-- CreateIndex
CREATE UNIQUE INDEX "partner_opportunities_opportunity_uid_key" ON "partner_opportunities"("opportunity_uid");

-- CreateIndex
CREATE INDEX "idx_opportunity_uid" ON "partner_opportunities"("opportunity_uid");

-- CreateIndex
CREATE INDEX "idx_opportunity_partner" ON "partner_opportunities"("partner_id");

-- CreateIndex
CREATE INDEX "idx_opportunity_partner_name" ON "partner_opportunities"("partner_name");

-- CreateIndex
CREATE INDEX "idx_opportunity_date" ON "partner_opportunities"("date_identified");

-- CreateIndex
CREATE INDEX "idx_opportunity_category" ON "partner_opportunities"("opportunity_category_id");

-- CreateIndex
CREATE INDEX "idx_opportunity_strategic_level" ON "partner_opportunities"("strategic_importance_level_id");

-- CreateIndex
CREATE INDEX "idx_opportunity_status" ON "partner_opportunities"("status");

-- CreateIndex
CREATE INDEX "idx_opportunity_creator" ON "partner_opportunities"("created_by");

-- AddForeignKey
ALTER TABLE "partner_opportunities" ADD CONSTRAINT "partner_opportunities_strategic_importance_level_id_fkey" FOREIGN KEY ("strategic_importance_level_id") REFERENCES "strategic_importance_levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_opportunities" ADD CONSTRAINT "partner_opportunities_opportunity_category_id_fkey" FOREIGN KEY ("opportunity_category_id") REFERENCES "opportunity_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_opportunities" ADD CONSTRAINT "partner_opportunities_opportunity_source_id_fkey" FOREIGN KEY ("opportunity_source_id") REFERENCES "opportunity_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_opportunities" ADD CONSTRAINT "partner_opportunities_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_opportunities" ADD CONSTRAINT "partner_opportunities_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_opportunities" ADD CONSTRAINT "partner_opportunities_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_opportunities" ADD CONSTRAINT "partner_opportunities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
