/*
  Warnings:

  - You are about to alter the column `ipAddress` on the `user_activity_logs` table. The data in that column could be lost. The data in that column will be cast from `Inet` to `Unsupported("inet")`.

*/
-- AlterTable
ALTER TABLE "user_activity_logs" ALTER COLUMN "ipAddress" SET DATA TYPE inet;

-- CreateTable
CREATE TABLE "visit_types" (
    "id" UUID NOT NULL,
    "type_name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "visit_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visit_categories" (
    "id" UUID NOT NULL,
    "category_name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "visit_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visit_purposes" (
    "id" UUID NOT NULL,
    "purpose_name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "visit_purposes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visits" (
    "id" UUID NOT NULL,
    "visit_uid" UUID NOT NULL,
    "record_id" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "visit_type_id" UUID NOT NULL,
    "visit_category_id" UUID NOT NULL,
    "visit_date" DATE NOT NULL,
    "host_organization" VARCHAR(255) NOT NULL,
    "visiting_organization" VARCHAR(255) NOT NULL,
    "visit_location" VARCHAR(255),
    "purpose_of_visit_id" UUID NOT NULL,
    "purpose_other" TEXT,
    "focal_person_id" UUID NOT NULL,
    "partner_id" UUID,
    "status" VARCHAR(50) NOT NULL DEFAULT 'Planned',
    "created_by" UUID NOT NULL,
    "reviewed_by" UUID,
    "review_notes" TEXT,
    "review_date" TIMESTAMP(3),
    "verified_by" UUID,
    "verification_notes" TEXT,
    "verification_date" TIMESTAMP(3),
    "verified_status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visit_delegation_list" (
    "id" UUID NOT NULL,
    "delegate_uid" UUID NOT NULL,
    "visit_id" UUID NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "position" VARCHAR(255),
    "organization_name" VARCHAR(255) NOT NULL,
    "country" VARCHAR(100),
    "email" VARCHAR(255) NOT NULL,
    "phone_number" VARCHAR(50),
    "status" VARCHAR(50) NOT NULL DEFAULT 'Pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "visit_delegation_list_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visit_outcomes" (
    "id" UUID NOT NULL,
    "outcome_uid" UUID NOT NULL,
    "visit_id" UUID NOT NULL,
    "key_topics_discussed" TEXT,
    "opportunities_identified" TEXT,
    "agreements_reached" TEXT,
    "follow_up_actions" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "visit_outcomes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "visit_types_type_name_key" ON "visit_types"("type_name");

-- CreateIndex
CREATE INDEX "idx_visit_types_name" ON "visit_types"("type_name");

-- CreateIndex
CREATE UNIQUE INDEX "visit_categories_category_name_key" ON "visit_categories"("category_name");

-- CreateIndex
CREATE UNIQUE INDEX "visit_purposes_purpose_name_key" ON "visit_purposes"("purpose_name");

-- CreateIndex
CREATE UNIQUE INDEX "visits_visit_uid_key" ON "visits"("visit_uid");

-- CreateIndex
CREATE UNIQUE INDEX "visits_record_id_key" ON "visits"("record_id");

-- CreateIndex
CREATE INDEX "idx_visits_record_id" ON "visits"("record_id");

-- CreateIndex
CREATE INDEX "idx_visits_title" ON "visits"("title");

-- CreateIndex
CREATE INDEX "idx_visits_date" ON "visits"("visit_date");

-- CreateIndex
CREATE INDEX "idx_visits_type" ON "visits"("visit_type_id");

-- CreateIndex
CREATE INDEX "idx_visits_category" ON "visits"("visit_category_id");

-- CreateIndex
CREATE INDEX "idx_visits_partner" ON "visits"("partner_id");

-- CreateIndex
CREATE INDEX "idx_visits_status" ON "visits"("status");

-- CreateIndex
CREATE INDEX "idx_visits_host" ON "visits"("host_organization");

-- CreateIndex
CREATE INDEX "idx_visits_visiting" ON "visits"("visiting_organization");

-- CreateIndex
CREATE INDEX "idx_visits_focal_person" ON "visits"("focal_person_id");

-- CreateIndex
CREATE INDEX "idx_visits_creator" ON "visits"("created_by");

-- CreateIndex
CREATE UNIQUE INDEX "visit_delegation_list_delegate_uid_key" ON "visit_delegation_list"("delegate_uid");

-- CreateIndex
CREATE INDEX "idx_visit_delegates_visit" ON "visit_delegation_list"("visit_id");

-- CreateIndex
CREATE INDEX "idx_visit_delegates_org" ON "visit_delegation_list"("organization_name");

-- CreateIndex
CREATE INDEX "idx_visit_delegates_status" ON "visit_delegation_list"("status");

-- CreateIndex
CREATE UNIQUE INDEX "visit_outcomes_outcome_uid_key" ON "visit_outcomes"("outcome_uid");

-- CreateIndex
CREATE INDEX "idx_visit_outcomes_visit" ON "visit_outcomes"("visit_id");

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_visit_type_id_fkey" FOREIGN KEY ("visit_type_id") REFERENCES "visit_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_visit_category_id_fkey" FOREIGN KEY ("visit_category_id") REFERENCES "visit_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_purpose_of_visit_id_fkey" FOREIGN KEY ("purpose_of_visit_id") REFERENCES "visit_purposes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_focal_person_id_fkey" FOREIGN KEY ("focal_person_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_delegation_list" ADD CONSTRAINT "visit_delegation_list_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_outcomes" ADD CONSTRAINT "visit_outcomes_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
