/*
  Warnings:

  - You are about to alter the column `ipAddress` on the `user_activity_logs` table. The data in that column could be lost. The data in that column will be cast from `Inet` to `Unsupported("inet")`.

*/
-- CreateEnum
CREATE TYPE "RegistrationPath" AS ENUM ('FORMAL', 'DIRECT');

-- AlterTable
ALTER TABLE "user_activity_logs" ALTER COLUMN "ipAddress" SET DATA TYPE inet;

-- CreateTable
CREATE TABLE "agreement_types" (
    "id" UUID NOT NULL,
    "type_name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "agreement_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agreements" (
    "id" UUID NOT NULL,
    "agreement_uid" UUID NOT NULL,
    "agreement_id" VARCHAR(50) NOT NULL,
    "opportunity_id" UUID,
    "engagement_id" UUID,
    "partner_id" UUID,
    "agreement_title" VARCHAR(255) NOT NULL,
    "agreement_type_id" UUID NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "renewal_date" DATE,
    "legal_review_status" VARCHAR(50) NOT NULL DEFAULT 'Pending',
    "approval_status" VARCHAR(50) NOT NULL DEFAULT 'Draft',
    "signatories" TEXT NOT NULL,
    "signing_date" DATE,
    "partner_name" VARCHAR(255) NOT NULL,
    "eaii_responsible_division" VARCHAR(255) NOT NULL,
    "eaii_responsible_directorate" VARCHAR(255),
    "draft_versions" TEXT,
    "signed_version_path" TEXT,
    "amendments" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "previous_version_id" UUID,
    "status" VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    "created_by" UUID NOT NULL,
    "reviewed_by" UUID,
    "review_notes" TEXT,
    "review_date" TIMESTAMP(3),
    "verified_by" UUID,
    "verification_notes" TEXT,
    "verification_date" TIMESTAMP(3),
    "verified_status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "approved_by" UUID,
    "approval_notes" TEXT,
    "approval_date" TIMESTAMP(3),
    "approved_status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "legal_reviewed_by" UUID,
    "legal_review_notes" TEXT,
    "legal_review_date" TIMESTAMP(3),
    "legal_approved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "agreements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agreement_documents" (
    "id" UUID NOT NULL,
    "agreement_id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "document_category" VARCHAR(50) NOT NULL,
    "is_current_version" BOOLEAN NOT NULL DEFAULT true,
    "version_number" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "agreement_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agreement_amendments" (
    "id" UUID NOT NULL,
    "amendment_uid" UUID NOT NULL,
    "agreement_id" UUID NOT NULL,
    "amendment_title" VARCHAR(255) NOT NULL,
    "amendment_description" TEXT,
    "amendment_date" DATE NOT NULL,
    "effective_date" DATE NOT NULL,
    "changed_clauses" TEXT,
    "reason_for_amendment" TEXT,
    "document_id" UUID,
    "approved_by" UUID,
    "approved_date" DATE,
    "approval_status" VARCHAR(50) NOT NULL DEFAULT 'Pending',
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "agreement_amendments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agreement_review_history" (
    "id" UUID NOT NULL,
    "agreement_id" UUID NOT NULL,
    "reviewer_id" UUID NOT NULL,
    "review_type" VARCHAR(50) NOT NULL,
    "review_notes" TEXT,
    "review_status" VARCHAR(20) NOT NULL,
    "review_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agreement_review_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_types" (
    "id" UUID NOT NULL,
    "type_name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "organization_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_classifications" (
    "id" UUID NOT NULL,
    "classification_name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "partner_classifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_statuses" (
    "id" UUID NOT NULL,
    "status_name" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "partner_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partners" (
    "id" UUID NOT NULL,
    "partner_uid" UUID NOT NULL,
    "registration_path" "RegistrationPath" NOT NULL,
    "agreement_id" UUID,
    "opportunity_id" UUID,
    "engagement_id" UUID,
    "partner_name" VARCHAR(255) NOT NULL,
    "acronym" VARCHAR(50),
    "organization_type_id" UUID,
    "country" VARCHAR(100) NOT NULL,
    "region_state" VARCHAR(100),
    "city" VARCHAR(100),
    "address" TEXT,
    "website" VARCHAR(255),
    "year_established" INTEGER,
    "registration_license_number" VARCHAR(100),
    "tax_number" VARCHAR(50),
    "logo_url" TEXT,
    "mission" TEXT,
    "vision" TEXT,
    "strategic_focus_areas" TEXT,
    "key_expertise_areas" TEXT,
    "ai_focus_areas" TEXT,
    "annual_budget" DECIMAL(15,2),
    "number_of_employees" INTEGER,
    "geographic_coverage" TEXT,
    "partner_classification_id" UUID,
    "status_id" UUID NOT NULL,
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

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_contacts" (
    "id" UUID NOT NULL,
    "contact_uid" UUID NOT NULL,
    "partner_id" UUID NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "position_title" VARCHAR(255),
    "department" VARCHAR(255),
    "email" VARCHAR(255) NOT NULL,
    "mobile_phone" VARCHAR(50),
    "office_phone" VARCHAR(50),
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "role_in_partnership" TEXT,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "partner_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internal_focal_persons" (
    "id" UUID NOT NULL,
    "partner_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "position" VARCHAR(100),
    "division" VARCHAR(100),
    "directorate" VARCHAR(100),
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "internal_focal_persons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collaborations" (
    "id" UUID NOT NULL,
    "collaboration_uid" UUID NOT NULL,
    "collaboration_id" VARCHAR(50) NOT NULL,
    "partner_id" UUID NOT NULL,
    "agreement_id" UUID,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "collaboration_type" VARCHAR(50) NOT NULL,
    "start_date" DATE,
    "end_date" DATE,
    "status" VARCHAR(50) NOT NULL DEFAULT 'Planned',
    "rejection_reason" TEXT,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "collaborations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "joint_activities" (
    "id" UUID NOT NULL,
    "activity_uid" UUID NOT NULL,
    "activity_id" VARCHAR(50) NOT NULL,
    "collaboration_id" UUID NOT NULL,
    "partner_id" UUID NOT NULL,
    "activity_name" VARCHAR(255) NOT NULL,
    "activity_type" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "start_date" DATE,
    "end_date" DATE,
    "lead_organization_id" UUID NOT NULL,
    "eaii_responsible_unit" VARCHAR(255) NOT NULL,
    "partner_responsible_unit" VARCHAR(255),
    "planned_outputs" JSONB,
    "actual_outputs" JSONB,
    "approval_status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "approval_reason" TEXT,
    "approved_by" UUID,
    "approved_at" TIMESTAMP(3),
    "reviewed_by" UUID,
    "review_notes" TEXT,
    "review_date" TIMESTAMP(3),
    "verified_by" UUID,
    "verification_notes" TEXT,
    "verification_date" TIMESTAMP(3),
    "verified_status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "status" VARCHAR(50) NOT NULL DEFAULT 'Planned',
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "joint_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_outputs" (
    "id" UUID NOT NULL,
    "output_uid" UUID NOT NULL,
    "activity_id" UUID NOT NULL,
    "output_type" VARCHAR(20) NOT NULL,
    "output_description" TEXT NOT NULL,
    "quantity" INTEGER,
    "unit" VARCHAR(50),
    "completion_date" DATE,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "activity_outputs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL,
    "project_uid" UUID NOT NULL,
    "project_id" VARCHAR(50) NOT NULL,
    "collaboration_id" UUID NOT NULL,
    "partner_id" UUID NOT NULL,
    "project_name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "thematic_area" VARCHAR(100),
    "budget" DECIMAL(15,2),
    "funding_source" VARCHAR(255),
    "currency" VARCHAR(3),
    "project_manager" VARCHAR(255),
    "partner_lead" VARCHAR(255),
    "team_members" JSONB,
    "start_date" DATE,
    "end_date" DATE,
    "percentage_completion" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "milestones" JSONB,
    "deliverables" JSONB,
    "risks" JSONB,
    "status" VARCHAR(50) NOT NULL DEFAULT 'Planned',
    "approval_status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "approval_reason" TEXT,
    "approved_by" UUID,
    "approved_at" TIMESTAMP(3),
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_milestones" (
    "id" UUID NOT NULL,
    "milestone_uid" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "milestone_name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "due_date" DATE NOT NULL,
    "completion_date" DATE,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "percentage_complete" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "project_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_deliverables" (
    "id" UUID NOT NULL,
    "deliverable_uid" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "deliverable_name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "expected_date" DATE,
    "delivered_date" DATE,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "document_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "project_deliverables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_risks" (
    "id" UUID NOT NULL,
    "risk_uid" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "risk_description" TEXT NOT NULL,
    "mitigation_plan" TEXT,
    "likelihood" VARCHAR(20),
    "impact" VARCHAR(20),
    "status" VARCHAR(20) NOT NULL DEFAULT 'open',
    "owner_id" UUID,
    "identified_date" DATE NOT NULL,
    "resolved_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "project_risks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_contributions" (
    "id" UUID NOT NULL,
    "resource_uid" UUID NOT NULL,
    "resource_id" VARCHAR(50) NOT NULL,
    "collaboration_id" UUID NOT NULL,
    "partner_id" UUID NOT NULL,
    "project_id" UUID,
    "eaii_staff" TEXT,
    "eaii_infrastructure" TEXT,
    "eaii_funding" DECIMAL(15,2),
    "eaii_equipment" TEXT,
    "eaii_data_resources" TEXT,
    "partner_staff" TEXT,
    "partner_funding" DECIMAL(15,2),
    "partner_technology" TEXT,
    "partner_equipment" TEXT,
    "partner_expertise" TEXT,
    "estimated_monetary_value" DECIMAL(15,2),
    "estimated_in_kind_value" DECIMAL(15,2),
    "currency" VARCHAR(3),
    "status" VARCHAR(50) NOT NULL DEFAULT 'Active',
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "resource_contributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funding_grants" (
    "id" UUID NOT NULL,
    "grant_uid" UUID NOT NULL,
    "grant_id" VARCHAR(50) NOT NULL,
    "collaboration_id" UUID NOT NULL,
    "partner_id" UUID NOT NULL,
    "project_id" UUID,
    "resource_contribution_id" UUID,
    "donor_name" VARCHAR(255) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "submission_date" DATE,
    "approval_date" DATE,
    "start_date" DATE,
    "end_date" DATE,
    "status" VARCHAR(50) NOT NULL DEFAULT 'Concept',
    "grant_reference_number" VARCHAR(100),
    "description" TEXT,
    "disbursement_schedule" JSONB,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "funding_grants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grant_disbursements" (
    "id" UUID NOT NULL,
    "disbursement_uid" UUID NOT NULL,
    "grant_id" UUID NOT NULL,
    "disbursement_date" DATE NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "description" TEXT,
    "reference_number" VARCHAR(100),
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "grant_disbursements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collaboration_documents" (
    "id" UUID NOT NULL,
    "entity_type" VARCHAR(20) NOT NULL,
    "entity_id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "document_category" VARCHAR(50) NOT NULL,
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "collaboration_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_approval_history" (
    "id" UUID NOT NULL,
    "entity_type" VARCHAR(20) NOT NULL,
    "entity_id" UUID NOT NULL,
    "action" VARCHAR(20) NOT NULL,
    "action_by" UUID NOT NULL,
    "action_date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_approval_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agreement_types_type_name_key" ON "agreement_types"("type_name");

-- CreateIndex
CREATE INDEX "idx_agreement_types_name" ON "agreement_types"("type_name");

-- CreateIndex
CREATE UNIQUE INDEX "agreements_agreement_uid_key" ON "agreements"("agreement_uid");

-- CreateIndex
CREATE UNIQUE INDEX "agreements_agreement_id_key" ON "agreements"("agreement_id");

-- CreateIndex
CREATE INDEX "idx_agreements_agreement_id" ON "agreements"("agreement_id");

-- CreateIndex
CREATE INDEX "idx_agreements_opportunity" ON "agreements"("opportunity_id");

-- CreateIndex
CREATE INDEX "idx_agreements_engagement" ON "agreements"("engagement_id");

-- CreateIndex
CREATE INDEX "idx_agreements_partner" ON "agreements"("partner_id");

-- CreateIndex
CREATE INDEX "idx_agreements_type" ON "agreements"("agreement_type_id");

-- CreateIndex
CREATE INDEX "idx_agreements_status" ON "agreements"("status");

-- CreateIndex
CREATE INDEX "idx_agreements_start_date" ON "agreements"("start_date");

-- CreateIndex
CREATE INDEX "idx_agreements_end_date" ON "agreements"("end_date");

-- CreateIndex
CREATE INDEX "idx_agreements_signing_date" ON "agreements"("signing_date");

-- CreateIndex
CREATE INDEX "idx_agr_doc_agreement" ON "agreement_documents"("agreement_id");

-- CreateIndex
CREATE INDEX "idx_agr_doc_document" ON "agreement_documents"("document_id");

-- CreateIndex
CREATE INDEX "idx_agr_doc_category" ON "agreement_documents"("document_category");

-- CreateIndex
CREATE INDEX "idx_agr_doc_current" ON "agreement_documents"("is_current_version");

-- CreateIndex
CREATE UNIQUE INDEX "agreement_amendments_amendment_uid_key" ON "agreement_amendments"("amendment_uid");

-- CreateIndex
CREATE INDEX "idx_agr_amendments_agreement" ON "agreement_amendments"("agreement_id");

-- CreateIndex
CREATE INDEX "idx_agr_amendments_date" ON "agreement_amendments"("amendment_date");

-- CreateIndex
CREATE INDEX "idx_agr_amendments_document" ON "agreement_amendments"("document_id");

-- CreateIndex
CREATE INDEX "idx_agr_amendments_status" ON "agreement_amendments"("approval_status");

-- CreateIndex
CREATE INDEX "idx_agr_review_agreement" ON "agreement_review_history"("agreement_id");

-- CreateIndex
CREATE INDEX "idx_agr_review_reviewer" ON "agreement_review_history"("reviewer_id");

-- CreateIndex
CREATE INDEX "idx_agr_review_type" ON "agreement_review_history"("review_type");

-- CreateIndex
CREATE INDEX "idx_agr_review_date" ON "agreement_review_history"("review_date");

-- CreateIndex
CREATE UNIQUE INDEX "organization_types_type_name_key" ON "organization_types"("type_name");

-- CreateIndex
CREATE INDEX "idx_org_types_name" ON "organization_types"("type_name");

-- CreateIndex
CREATE UNIQUE INDEX "partner_classifications_classification_name_key" ON "partner_classifications"("classification_name");

-- CreateIndex
CREATE UNIQUE INDEX "partner_statuses_status_name_key" ON "partner_statuses"("status_name");

-- CreateIndex
CREATE UNIQUE INDEX "partners_partner_uid_key" ON "partners"("partner_uid");

-- CreateIndex
CREATE INDEX "idx_partners_name" ON "partners"("partner_name");

-- CreateIndex
CREATE INDEX "idx_partners_country" ON "partners"("country");

-- CreateIndex
CREATE INDEX "idx_partners_status" ON "partners"("status_id");

-- CreateIndex
CREATE INDEX "idx_partners_org_type" ON "partners"("organization_type_id");

-- CreateIndex
CREATE INDEX "idx_partners_agreement" ON "partners"("agreement_id");

-- CreateIndex
CREATE INDEX "idx_partners_opportunity" ON "partners"("opportunity_id");

-- CreateIndex
CREATE INDEX "idx_partners_engagement" ON "partners"("engagement_id");

-- CreateIndex
CREATE INDEX "idx_partners_registration_path" ON "partners"("registration_path");

-- CreateIndex
CREATE UNIQUE INDEX "partner_contacts_contact_uid_key" ON "partner_contacts"("contact_uid");

-- CreateIndex
CREATE INDEX "idx_contacts_partner" ON "partner_contacts"("partner_id");

-- CreateIndex
CREATE INDEX "idx_contacts_email" ON "partner_contacts"("email");

-- CreateIndex
CREATE INDEX "idx_contacts_primary" ON "partner_contacts"("is_primary");

-- CreateIndex
CREATE INDEX "idx_focal_partner" ON "internal_focal_persons"("partner_id");

-- CreateIndex
CREATE UNIQUE INDEX "collaborations_collaboration_uid_key" ON "collaborations"("collaboration_uid");

-- CreateIndex
CREATE UNIQUE INDEX "collaborations_collaboration_id_key" ON "collaborations"("collaboration_id");

-- CreateIndex
CREATE INDEX "idx_collaborations_id" ON "collaborations"("collaboration_id");

-- CreateIndex
CREATE INDEX "idx_collaborations_partner" ON "collaborations"("partner_id");

-- CreateIndex
CREATE INDEX "idx_collaborations_agreement" ON "collaborations"("agreement_id");

-- CreateIndex
CREATE INDEX "idx_collaborations_type" ON "collaborations"("collaboration_type");

-- CreateIndex
CREATE INDEX "idx_collaborations_status" ON "collaborations"("status");

-- CreateIndex
CREATE INDEX "idx_collaborations_start_date" ON "collaborations"("start_date");

-- CreateIndex
CREATE INDEX "idx_collaborations_end_date" ON "collaborations"("end_date");

-- CreateIndex
CREATE INDEX "idx_collaborations_creator" ON "collaborations"("created_by");

-- CreateIndex
CREATE UNIQUE INDEX "joint_activities_activity_uid_key" ON "joint_activities"("activity_uid");

-- CreateIndex
CREATE UNIQUE INDEX "joint_activities_activity_id_key" ON "joint_activities"("activity_id");

-- CreateIndex
CREATE INDEX "idx_joint_activities_id" ON "joint_activities"("activity_id");

-- CreateIndex
CREATE INDEX "idx_joint_activities_collaboration" ON "joint_activities"("collaboration_id");

-- CreateIndex
CREATE INDEX "idx_joint_activities_partner" ON "joint_activities"("partner_id");

-- CreateIndex
CREATE INDEX "idx_joint_activities_type" ON "joint_activities"("activity_type");

-- CreateIndex
CREATE INDEX "idx_joint_activities_status" ON "joint_activities"("status");

-- CreateIndex
CREATE INDEX "idx_joint_activities_approval" ON "joint_activities"("approval_status");

-- CreateIndex
CREATE INDEX "idx_joint_activities_start_date" ON "joint_activities"("start_date");

-- CreateIndex
CREATE INDEX "idx_joint_activities_end_date" ON "joint_activities"("end_date");

-- CreateIndex
CREATE UNIQUE INDEX "activity_outputs_output_uid_key" ON "activity_outputs"("output_uid");

-- CreateIndex
CREATE INDEX "idx_activity_outputs_activity" ON "activity_outputs"("activity_id");

-- CreateIndex
CREATE INDEX "idx_activity_outputs_type" ON "activity_outputs"("output_type");

-- CreateIndex
CREATE INDEX "idx_activity_outputs_status" ON "activity_outputs"("status");

-- CreateIndex
CREATE UNIQUE INDEX "projects_project_uid_key" ON "projects"("project_uid");

-- CreateIndex
CREATE UNIQUE INDEX "projects_project_id_key" ON "projects"("project_id");

-- CreateIndex
CREATE INDEX "idx_projects_id" ON "projects"("project_id");

-- CreateIndex
CREATE INDEX "idx_projects_collaboration" ON "projects"("collaboration_id");

-- CreateIndex
CREATE INDEX "idx_projects_partner" ON "projects"("partner_id");

-- CreateIndex
CREATE INDEX "idx_projects_thematic_area" ON "projects"("thematic_area");

-- CreateIndex
CREATE INDEX "idx_projects_status" ON "projects"("status");

-- CreateIndex
CREATE INDEX "idx_projects_approval" ON "projects"("approval_status");

-- CreateIndex
CREATE INDEX "idx_projects_start_date" ON "projects"("start_date");

-- CreateIndex
CREATE INDEX "idx_projects_end_date" ON "projects"("end_date");

-- CreateIndex
CREATE UNIQUE INDEX "project_milestones_milestone_uid_key" ON "project_milestones"("milestone_uid");

-- CreateIndex
CREATE INDEX "idx_milestones_project" ON "project_milestones"("project_id");

-- CreateIndex
CREATE INDEX "idx_milestones_status" ON "project_milestones"("status");

-- CreateIndex
CREATE INDEX "idx_milestones_due_date" ON "project_milestones"("due_date");

-- CreateIndex
CREATE UNIQUE INDEX "project_deliverables_deliverable_uid_key" ON "project_deliverables"("deliverable_uid");

-- CreateIndex
CREATE INDEX "idx_deliverables_project" ON "project_deliverables"("project_id");

-- CreateIndex
CREATE INDEX "idx_deliverables_status" ON "project_deliverables"("status");

-- CreateIndex
CREATE INDEX "idx_deliverables_document" ON "project_deliverables"("document_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_risks_risk_uid_key" ON "project_risks"("risk_uid");

-- CreateIndex
CREATE INDEX "idx_project_risks_project" ON "project_risks"("project_id");

-- CreateIndex
CREATE INDEX "idx_project_risks_status" ON "project_risks"("status");

-- CreateIndex
CREATE INDEX "idx_project_risks_owner" ON "project_risks"("owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "resource_contributions_resource_uid_key" ON "resource_contributions"("resource_uid");

-- CreateIndex
CREATE UNIQUE INDEX "resource_contributions_resource_id_key" ON "resource_contributions"("resource_id");

-- CreateIndex
CREATE INDEX "idx_resources_id" ON "resource_contributions"("resource_id");

-- CreateIndex
CREATE INDEX "idx_resources_collaboration" ON "resource_contributions"("collaboration_id");

-- CreateIndex
CREATE INDEX "idx_resources_partner" ON "resource_contributions"("partner_id");

-- CreateIndex
CREATE INDEX "idx_resources_project" ON "resource_contributions"("project_id");

-- CreateIndex
CREATE INDEX "idx_resources_status" ON "resource_contributions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "funding_grants_grant_uid_key" ON "funding_grants"("grant_uid");

-- CreateIndex
CREATE UNIQUE INDEX "funding_grants_grant_id_key" ON "funding_grants"("grant_id");

-- CreateIndex
CREATE INDEX "idx_grants_id" ON "funding_grants"("grant_id");

-- CreateIndex
CREATE INDEX "idx_grants_collaboration" ON "funding_grants"("collaboration_id");

-- CreateIndex
CREATE INDEX "idx_grants_partner" ON "funding_grants"("partner_id");

-- CreateIndex
CREATE INDEX "idx_grants_project" ON "funding_grants"("project_id");

-- CreateIndex
CREATE INDEX "idx_grants_resource" ON "funding_grants"("resource_contribution_id");

-- CreateIndex
CREATE INDEX "idx_grants_status" ON "funding_grants"("status");

-- CreateIndex
CREATE INDEX "idx_grants_donor" ON "funding_grants"("donor_name");

-- CreateIndex
CREATE INDEX "idx_grants_submission_date" ON "funding_grants"("submission_date");

-- CreateIndex
CREATE INDEX "idx_grants_approval_date" ON "funding_grants"("approval_date");

-- CreateIndex
CREATE INDEX "idx_grants_end_date" ON "funding_grants"("end_date");

-- CreateIndex
CREATE UNIQUE INDEX "grant_disbursements_disbursement_uid_key" ON "grant_disbursements"("disbursement_uid");

-- CreateIndex
CREATE INDEX "idx_disbursements_grant" ON "grant_disbursements"("grant_id");

-- CreateIndex
CREATE INDEX "idx_disbursements_date" ON "grant_disbursements"("disbursement_date");

-- CreateIndex
CREATE INDEX "idx_disbursements_status" ON "grant_disbursements"("status");

-- CreateIndex
CREATE INDEX "idx_collab_doc_document" ON "collaboration_documents"("document_id");

-- CreateIndex
CREATE INDEX "idx_collab_doc_category" ON "collaboration_documents"("document_category");

-- CreateIndex
CREATE INDEX "idx_collab_doc_current" ON "collaboration_documents"("is_current");

-- CreateIndex
CREATE INDEX "idx_act_approval_user" ON "activity_approval_history"("action_by");

-- CreateIndex
CREATE INDEX "idx_act_approval_date" ON "activity_approval_history"("action_date");

-- CreateIndex
CREATE INDEX "idx_act_approval_action" ON "activity_approval_history"("action");

-- AddForeignKey
ALTER TABLE "agreements" ADD CONSTRAINT "agreements_agreement_type_id_fkey" FOREIGN KEY ("agreement_type_id") REFERENCES "agreement_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agreements" ADD CONSTRAINT "agreements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agreement_documents" ADD CONSTRAINT "agreement_documents_agreement_id_fkey" FOREIGN KEY ("agreement_id") REFERENCES "agreements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agreement_amendments" ADD CONSTRAINT "agreement_amendments_agreement_id_fkey" FOREIGN KEY ("agreement_id") REFERENCES "agreements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agreement_review_history" ADD CONSTRAINT "agreement_review_history_agreement_id_fkey" FOREIGN KEY ("agreement_id") REFERENCES "agreements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partners" ADD CONSTRAINT "partners_agreement_id_fkey" FOREIGN KEY ("agreement_id") REFERENCES "agreements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partners" ADD CONSTRAINT "partners_organization_type_id_fkey" FOREIGN KEY ("organization_type_id") REFERENCES "organization_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partners" ADD CONSTRAINT "partners_partner_classification_id_fkey" FOREIGN KEY ("partner_classification_id") REFERENCES "partner_classifications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partners" ADD CONSTRAINT "partners_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "partner_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partners" ADD CONSTRAINT "partners_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_contacts" ADD CONSTRAINT "partner_contacts_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internal_focal_persons" ADD CONSTRAINT "internal_focal_persons_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internal_focal_persons" ADD CONSTRAINT "internal_focal_persons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collaborations" ADD CONSTRAINT "collaborations_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collaborations" ADD CONSTRAINT "collaborations_agreement_id_fkey" FOREIGN KEY ("agreement_id") REFERENCES "agreements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collaborations" ADD CONSTRAINT "collaborations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "joint_activities" ADD CONSTRAINT "joint_activities_collaboration_id_fkey" FOREIGN KEY ("collaboration_id") REFERENCES "collaborations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "joint_activities" ADD CONSTRAINT "joint_activities_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_outputs" ADD CONSTRAINT "activity_outputs_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "joint_activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_collaboration_id_fkey" FOREIGN KEY ("collaboration_id") REFERENCES "collaborations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_milestones" ADD CONSTRAINT "project_milestones_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_deliverables" ADD CONSTRAINT "project_deliverables_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_risks" ADD CONSTRAINT "project_risks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_contributions" ADD CONSTRAINT "resource_contributions_collaboration_id_fkey" FOREIGN KEY ("collaboration_id") REFERENCES "collaborations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_contributions" ADD CONSTRAINT "resource_contributions_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funding_grants" ADD CONSTRAINT "funding_grants_collaboration_id_fkey" FOREIGN KEY ("collaboration_id") REFERENCES "collaborations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funding_grants" ADD CONSTRAINT "funding_grants_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grant_disbursements" ADD CONSTRAINT "grant_disbursements_grant_id_fkey" FOREIGN KEY ("grant_id") REFERENCES "funding_grants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
