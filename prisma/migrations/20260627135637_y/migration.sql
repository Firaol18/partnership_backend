/*
  Warnings:

  - You are about to alter the column `ipAddress` on the `user_activity_logs` table. The data in that column could be lost. The data in that column will be cast from `Inet` to `Unsupported("inet")`.

*/
-- AlterTable
ALTER TABLE "user_activity_logs" ALTER COLUMN "ipAddress" SET DATA TYPE inet;

-- CreateTable
CREATE TABLE "document_types" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "document_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL,
    "document_uid" UUID NOT NULL,
    "document_name" VARCHAR(255) NOT NULL,
    "document_type_id" UUID NOT NULL,
    "description" TEXT,
    "file_name" VARCHAR(255) NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" BIGINT,
    "file_format" VARCHAR(20),
    "mime_type" VARCHAR(100),
    "version" VARCHAR(20) DEFAULT '1.0',
    "is_latest_version" BOOLEAN NOT NULL DEFAULT true,
    "previous_version_id" UUID,
    "entity_type" VARCHAR(50),
    "entity_id" UUID,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "access_level" VARCHAR(20) NOT NULL DEFAULT 'internal',
    "access_expiry_date" TIMESTAMP(3),
    "downloaded_count" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(50) NOT NULL DEFAULT 'Active',
    "uploaded_by" UUID NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_tags" (
    "id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "tag_name" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_types" (
    "id" UUID NOT NULL,
    "type_name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "event_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_categories" (
    "id" UUID NOT NULL,
    "category_name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "event_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_modes" (
    "id" UUID NOT NULL,
    "mode_name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "event_modes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL,
    "event_uid" UUID NOT NULL,
    "record_id" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "event_name" VARCHAR(255) NOT NULL,
    "event_type_id" UUID NOT NULL,
    "event_category_id" UUID NOT NULL,
    "event_date" DATE NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "venue" VARCHAR(255) NOT NULL,
    "organizer" VARCHAR(255),
    "co_organizer" VARCHAR(255),
    "event_mode_id" UUID NOT NULL,
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

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_participants" (
    "id" UUID NOT NULL,
    "participant_uid" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "organization_name" VARCHAR(255) NOT NULL,
    "position" VARCHAR(255),
    "email" VARCHAR(255) NOT NULL,
    "phone_number" VARCHAR(50),
    "participant_type" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "event_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_eaii_participants" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "event_eaii_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_budget" (
    "id" UUID NOT NULL,
    "budget_uid" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "estimated_budget" DECIMAL(15,2),
    "actual_budget" DECIMAL(15,2),
    "funding_source" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "event_budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_outcomes" (
    "id" UUID NOT NULL,
    "outcome_uid" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "key_discussions" TEXT,
    "agreements_reached" TEXT,
    "action_points" TEXT,
    "objectives_achieved" TEXT,
    "recommendations" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "event_outcomes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "document_types_name_key" ON "document_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "documents_document_uid_key" ON "documents"("document_uid");

-- CreateIndex
CREATE INDEX "idx_docs_latest" ON "documents"("is_latest_version");

-- CreateIndex
CREATE INDEX "idx_docs_status" ON "documents"("status");

-- CreateIndex
CREATE INDEX "idx_docs_type" ON "documents"("document_type_id");

-- CreateIndex
CREATE INDEX "idx_docs_uploader" ON "documents"("uploaded_by");

-- CreateIndex
CREATE INDEX "idx_doc_tags_doc" ON "document_tags"("document_id");

-- CreateIndex
CREATE INDEX "idx_doc_tags_name" ON "document_tags"("tag_name");

-- CreateIndex
CREATE UNIQUE INDEX "document_tags_document_id_tag_name_key" ON "document_tags"("document_id", "tag_name");

-- CreateIndex
CREATE UNIQUE INDEX "event_types_type_name_key" ON "event_types"("type_name");

-- CreateIndex
CREATE INDEX "idx_event_types_name" ON "event_types"("type_name");

-- CreateIndex
CREATE UNIQUE INDEX "event_categories_category_name_key" ON "event_categories"("category_name");

-- CreateIndex
CREATE INDEX "idx_event_categories_name" ON "event_categories"("category_name");

-- CreateIndex
CREATE UNIQUE INDEX "event_modes_mode_name_key" ON "event_modes"("mode_name");

-- CreateIndex
CREATE UNIQUE INDEX "events_event_uid_key" ON "events"("event_uid");

-- CreateIndex
CREATE UNIQUE INDEX "events_record_id_key" ON "events"("record_id");

-- CreateIndex
CREATE INDEX "idx_events_record_id" ON "events"("record_id");

-- CreateIndex
CREATE INDEX "idx_events_name" ON "events"("event_name");

-- CreateIndex
CREATE INDEX "idx_events_date" ON "events"("event_date");

-- CreateIndex
CREATE INDEX "idx_events_type" ON "events"("event_type_id");

-- CreateIndex
CREATE INDEX "idx_events_category" ON "events"("event_category_id");

-- CreateIndex
CREATE INDEX "idx_events_partner" ON "events"("partner_id");

-- CreateIndex
CREATE INDEX "idx_events_status" ON "events"("status");

-- CreateIndex
CREATE INDEX "idx_events_creator" ON "events"("created_by");

-- CreateIndex
CREATE UNIQUE INDEX "event_participants_participant_uid_key" ON "event_participants"("participant_uid");

-- CreateIndex
CREATE INDEX "idx_event_participants_event" ON "event_participants"("event_id");

-- CreateIndex
CREATE INDEX "idx_event_participants_email" ON "event_participants"("email");

-- CreateIndex
CREATE INDEX "idx_event_participants_org" ON "event_participants"("organization_name");

-- CreateIndex
CREATE INDEX "idx_event_eaii_event" ON "event_eaii_participants"("event_id");

-- CreateIndex
CREATE INDEX "idx_event_eaii_user" ON "event_eaii_participants"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_eaii_participants_event_id_user_id_key" ON "event_eaii_participants"("event_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_budget_budget_uid_key" ON "event_budget"("budget_uid");

-- CreateIndex
CREATE INDEX "idx_event_budget_event" ON "event_budget"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_outcomes_outcome_uid_key" ON "event_outcomes"("outcome_uid");

-- CreateIndex
CREATE INDEX "idx_event_outcomes_event" ON "event_outcomes"("event_id");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_document_type_id_fkey" FOREIGN KEY ("document_type_id") REFERENCES "document_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_previous_version_id_fkey" FOREIGN KEY ("previous_version_id") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_tags" ADD CONSTRAINT "document_tags_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_event_type_id_fkey" FOREIGN KEY ("event_type_id") REFERENCES "event_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_event_category_id_fkey" FOREIGN KEY ("event_category_id") REFERENCES "event_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_event_mode_id_fkey" FOREIGN KEY ("event_mode_id") REFERENCES "event_modes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_eaii_participants" ADD CONSTRAINT "event_eaii_participants_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_eaii_participants" ADD CONSTRAINT "event_eaii_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_budget" ADD CONSTRAINT "event_budget_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_outcomes" ADD CONSTRAINT "event_outcomes_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
