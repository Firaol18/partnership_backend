/*
  Warnings:

  - You are about to alter the column `ipAddress` on the `user_activity_logs` table. The data in that column could be lost. The data in that column will be cast from `Inet` to `Unsupported("inet")`.

*/
-- AlterTable
ALTER TABLE "user_activity_logs" ALTER COLUMN "ipAddress" SET DATA TYPE inet;

-- CreateTable
CREATE TABLE "communication_types" (
    "id" UUID NOT NULL,
    "type_name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "communication_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opportunity_communications" (
    "id" UUID NOT NULL,
    "communication_uid" UUID NOT NULL,
    "opportunity_id" UUID NOT NULL,
    "communication_type_id" UUID NOT NULL,
    "email_subject" VARCHAR(255) NOT NULL,
    "email_recipient" VARCHAR(255) NOT NULL,
    "email_body" TEXT NOT NULL,
    "sent_date" TIMESTAMP(3) NOT NULL,
    "cc_recipients" TEXT,
    "bcc_recipients" TEXT,
    "has_attachments" BOOLEAN NOT NULL DEFAULT false,
    "sent_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "userId" UUID,

    CONSTRAINT "opportunity_communications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engagement_types" (
    "id" UUID NOT NULL,
    "type_name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "engagement_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engagements" (
    "id" UUID NOT NULL,
    "engagement_uid" UUID NOT NULL,
    "record_id" VARCHAR(50) NOT NULL,
    "opportunity_id" UUID NOT NULL,
    "engagement_type_id" UUID NOT NULL,
    "engagement_date" DATE NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "location" VARCHAR(255),
    "start_time" TIME,
    "end_time" TIME,
    "key_points" TEXT NOT NULL,
    "agreed_actions" TEXT NOT NULL,
    "next_steps" TEXT NOT NULL,
    "follow_up_required" BOOLEAN NOT NULL DEFAULT false,
    "follow_up_date" DATE,
    "follow_up_notes" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'Draft',
    "created_by" UUID NOT NULL,
    "approved_by" UUID,
    "approval_notes" TEXT,
    "approval_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "userId" UUID,

    CONSTRAINT "engagements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engagement_external_participants" (
    "id" UUID NOT NULL,
    "engagement_id" UUID NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "organization_name" VARCHAR(255) NOT NULL,
    "position" VARCHAR(255),
    "email" VARCHAR(255),
    "phone_number" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "engagement_external_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engagement_eaii_representatives" (
    "id" UUID NOT NULL,
    "engagement_id" UUID NOT NULL,
    "user_id" UUID,
    "full_name" VARCHAR(255) NOT NULL,
    "division" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "role" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "engagement_eaii_representatives_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "communication_types_type_name_key" ON "communication_types"("type_name");

-- CreateIndex
CREATE INDEX "idx_comm_types_name" ON "communication_types"("type_name");

-- CreateIndex
CREATE UNIQUE INDEX "opportunity_communications_communication_uid_key" ON "opportunity_communications"("communication_uid");

-- CreateIndex
CREATE INDEX "idx_comm_opportunity" ON "opportunity_communications"("opportunity_id");

-- CreateIndex
CREATE INDEX "idx_comm_sent_date" ON "opportunity_communications"("sent_date");

-- CreateIndex
CREATE INDEX "idx_comm_type" ON "opportunity_communications"("communication_type_id");

-- CreateIndex
CREATE INDEX "idx_comm_sender" ON "opportunity_communications"("sent_by");

-- CreateIndex
CREATE UNIQUE INDEX "engagement_types_type_name_key" ON "engagement_types"("type_name");

-- CreateIndex
CREATE INDEX "idx_engagement_types_name" ON "engagement_types"("type_name");

-- CreateIndex
CREATE UNIQUE INDEX "engagements_engagement_uid_key" ON "engagements"("engagement_uid");

-- CreateIndex
CREATE UNIQUE INDEX "engagements_record_id_key" ON "engagements"("record_id");

-- CreateIndex
CREATE INDEX "idx_engagements_record_id" ON "engagements"("record_id");

-- CreateIndex
CREATE INDEX "idx_engagements_opportunity" ON "engagements"("opportunity_id");

-- CreateIndex
CREATE INDEX "idx_engagements_date" ON "engagements"("engagement_date");

-- CreateIndex
CREATE INDEX "idx_engagements_type" ON "engagements"("engagement_type_id");

-- CreateIndex
CREATE INDEX "idx_engagements_status" ON "engagements"("status");

-- CreateIndex
CREATE INDEX "idx_engagements_creator" ON "engagements"("created_by");

-- CreateIndex
CREATE INDEX "idx_eng_ext_part_engagement" ON "engagement_external_participants"("engagement_id");

-- CreateIndex
CREATE INDEX "idx_eng_ext_part_org" ON "engagement_external_participants"("organization_name");

-- CreateIndex
CREATE INDEX "idx_eng_eaii_rep_engagement" ON "engagement_eaii_representatives"("engagement_id");

-- CreateIndex
CREATE INDEX "idx_eng_eaii_rep_user" ON "engagement_eaii_representatives"("user_id");

-- AddForeignKey
ALTER TABLE "opportunity_communications" ADD CONSTRAINT "opportunity_communications_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "partner_opportunities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity_communications" ADD CONSTRAINT "opportunity_communications_communication_type_id_fkey" FOREIGN KEY ("communication_type_id") REFERENCES "communication_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity_communications" ADD CONSTRAINT "opportunity_communications_sent_by_fkey" FOREIGN KEY ("sent_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity_communications" ADD CONSTRAINT "opportunity_communications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagements" ADD CONSTRAINT "engagements_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "partner_opportunities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagements" ADD CONSTRAINT "engagements_engagement_type_id_fkey" FOREIGN KEY ("engagement_type_id") REFERENCES "engagement_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagements" ADD CONSTRAINT "engagements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagements" ADD CONSTRAINT "engagements_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagements" ADD CONSTRAINT "engagements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagement_external_participants" ADD CONSTRAINT "engagement_external_participants_engagement_id_fkey" FOREIGN KEY ("engagement_id") REFERENCES "engagements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagement_eaii_representatives" ADD CONSTRAINT "engagement_eaii_representatives_engagement_id_fkey" FOREIGN KEY ("engagement_id") REFERENCES "engagements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagement_eaii_representatives" ADD CONSTRAINT "engagement_eaii_representatives_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
