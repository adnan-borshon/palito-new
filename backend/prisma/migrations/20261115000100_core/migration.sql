BEGIN;
-- Application schema is pre-provisioned by the administrator bootstrap.

-- CreateEnum
CREATE TYPE "palito"."AccountStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "palito"."OrganizationKind" AS ENUM ('PLATFORM', 'BANK', 'INSURER', 'CLINIC');

-- CreateEnum
CREATE TYPE "palito"."StaffRole" AS ENUM ('ADMIN', 'BANK_STAFF', 'INSURER_STAFF', 'VET');

-- CreateEnum
CREATE TYPE "palito"."MembershipStatus" AS ENUM ('INVITED', 'ACTIVE', 'SUSPENDED', 'REVOKED');

-- CreateEnum
CREATE TYPE "palito"."CredentialStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'REVOKED');

-- CreateEnum
CREATE TYPE "palito"."AnimalStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'DECEASED');

-- CreateEnum
CREATE TYPE "palito"."AppointmentStatus" AS ENUM ('REQUESTED', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "palito"."RecordSource" AS ENUM ('FARMER', 'VET');

-- CreateEnum
CREATE TYPE "palito"."ValuationStatus" AS ENUM ('DRAFT', 'APPROVED');

-- CreateTable
CREATE TABLE "palito"."users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "firebase_uid" VARCHAR(128) NOT NULL,
    "display_name" VARCHAR(120) NOT NULL,
    "phone_e164" VARCHAR(16),
    "email_normalized" VARCHAR(254),
    "locale" VARCHAR(2) NOT NULL DEFAULT 'bn',
    "status" "palito"."AccountStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "palito"."organizations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "kind" "palito"."OrganizationKind" NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "status" "palito"."AccountStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "palito"."memberships" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "organization_kind" "palito"."OrganizationKind" NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "palito"."StaffRole" NOT NULL,
    "status" "palito"."MembershipStatus" NOT NULL DEFAULT 'INVITED',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "palito"."vet_credentials" (
    "user_id" UUID NOT NULL,
    "registration_number" VARCHAR(80) NOT NULL,
    "status" "palito"."CredentialStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by_id" UUID,
    "reviewed_at" TIMESTAMPTZ(3),

    CONSTRAINT "vet_credentials_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "palito"."farms" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "owner_id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "district" VARCHAR(120) NOT NULL,
    "address" VARCHAR(500) NOT NULL,
    "area_acres" DECIMAL(12,3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "farms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "palito"."farm_memberships" (
    "farm_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "status" "palito"."MembershipStatus" NOT NULL DEFAULT 'INVITED',

    CONSTRAINT "farm_memberships_pkey" PRIMARY KEY ("farm_id","user_id")
);

-- CreateTable
CREATE TABLE "palito"."animals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "farm_id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "tag" VARCHAR(80) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "species" VARCHAR(40) NOT NULL,
    "breed" VARCHAR(120) NOT NULL,
    "sex" VARCHAR(10) NOT NULL,
    "birth_date" DATE NOT NULL,
    "weight_kg" DECIMAL(8,3) NOT NULL,
    "estimate_minor" BIGINT NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'BDT',
    "status" "palito"."AnimalStatus" NOT NULL DEFAULT 'ACTIVE',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "animals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "palito"."ownership_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "animal_id" UUID NOT NULL,
    "from_owner_id" UUID,
    "to_owner_id" UUID NOT NULL,
    "reason" VARCHAR(1000) NOT NULL,
    "occurred_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ownership_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "palito"."valuations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "animal_id" UUID NOT NULL,
    "owner_at_assessment_id" UUID NOT NULL,
    "assessor_id" UUID NOT NULL,
    "approved_by_id" UUID,
    "version" INTEGER NOT NULL,
    "status" "palito"."ValuationStatus" NOT NULL DEFAULT 'DRAFT',
    "amount_minor" BIGINT NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'BDT',
    "assessed_at" TIMESTAMPTZ(3) NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "approved_at" TIMESTAMPTZ(3),

    CONSTRAINT "valuations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "palito"."appointments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "animal_id" UUID NOT NULL,
    "farm_id" UUID NOT NULL,
    "farmer_id" UUID NOT NULL,
    "vet_id" UUID NOT NULL,
    "starts_at" TIMESTAMPTZ(3) NOT NULL,
    "ends_at" TIMESTAMPTZ(3) NOT NULL,
    "mode" VARCHAR(10) NOT NULL,
    "reason" VARCHAR(2000) NOT NULL,
    "status" "palito"."AppointmentStatus" NOT NULL DEFAULT 'REQUESTED',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "palito"."health_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "animal_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "vet_id" UUID,
    "appointment_id" UUID,
    "source" "palito"."RecordSource" NOT NULL,
    "kind" VARCHAR(20) NOT NULL,
    "note" VARCHAR(4000) NOT NULL,
    "signed_at" TIMESTAMPTZ(3),
    "amends_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "palito"."prescriptions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "record_id" UUID NOT NULL,
    "animal_id" UUID NOT NULL,
    "vet_id" UUID NOT NULL,
    "advice" VARCHAR(4000) NOT NULL,
    "signed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "palito"."prescription_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "prescription_id" UUID NOT NULL,
    "medicine_name" VARCHAR(200) NOT NULL,
    "dose" VARCHAR(200) NOT NULL,
    "frequency" VARCHAR(200) NOT NULL,
    "days" INTEGER NOT NULL,

    CONSTRAINT "prescription_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_firebase_uid_key" ON "palito"."users"("firebase_uid");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_e164_key" ON "palito"."users"("phone_e164");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_normalized_key" ON "palito"."users"("email_normalized");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_id_kind_key" ON "palito"."organizations"("id", "kind");

-- CreateIndex
CREATE INDEX "memberships_organization_id_status_id_idx" ON "palito"."memberships"("organization_id", "status", "id");

-- CreateIndex
CREATE INDEX "memberships_user_id_status_idx" ON "palito"."memberships"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "memberships_organization_id_user_id_key" ON "palito"."memberships"("organization_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "vet_credentials_registration_number_key" ON "palito"."vet_credentials"("registration_number");

-- CreateIndex
CREATE INDEX "farms_owner_id_created_at_id_idx" ON "palito"."farms"("owner_id", "created_at", "id");

-- CreateIndex
CREATE UNIQUE INDEX "farms_id_owner_id_key" ON "palito"."farms"("id", "owner_id");

-- CreateIndex
CREATE INDEX "farm_memberships_user_id_status_idx" ON "palito"."farm_memberships"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "animals_tag_key" ON "palito"."animals"("tag");

-- CreateIndex
CREATE INDEX "animals_owner_id_created_at_id_idx" ON "palito"."animals"("owner_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "animals_farm_id_status_idx" ON "palito"."animals"("farm_id", "status");

-- CreateIndex
CREATE INDEX "ownership_history_animal_id_occurred_at_id_idx" ON "palito"."ownership_history"("animal_id", "occurred_at", "id");

-- CreateIndex
CREATE INDEX "valuations_animal_id_status_expires_at_idx" ON "palito"."valuations"("animal_id", "status", "expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "valuations_animal_id_version_key" ON "palito"."valuations"("animal_id", "version");

-- CreateIndex
CREATE INDEX "appointments_farmer_id_starts_at_id_idx" ON "palito"."appointments"("farmer_id", "starts_at", "id");

-- CreateIndex
CREATE INDEX "appointments_vet_id_starts_at_id_idx" ON "palito"."appointments"("vet_id", "starts_at", "id");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_id_animal_id_vet_id_key" ON "palito"."appointments"("id", "animal_id", "vet_id");

-- CreateIndex
CREATE INDEX "health_records_animal_id_created_at_id_idx" ON "palito"."health_records"("animal_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "health_records_author_id_idx" ON "palito"."health_records"("author_id");

-- CreateIndex
CREATE UNIQUE INDEX "health_records_id_animal_id_key" ON "palito"."health_records"("id", "animal_id");

-- CreateIndex
CREATE UNIQUE INDEX "health_records_id_animal_id_vet_id_key" ON "palito"."health_records"("id", "animal_id", "vet_id");

-- CreateIndex
CREATE UNIQUE INDEX "prescriptions_record_id_key" ON "palito"."prescriptions"("record_id");

-- CreateIndex
CREATE UNIQUE INDEX "prescriptions_record_id_animal_id_vet_id_key" ON "palito"."prescriptions"("record_id", "animal_id", "vet_id");

-- CreateIndex
CREATE INDEX "prescription_items_prescription_id_idx" ON "palito"."prescription_items"("prescription_id");

-- AddForeignKey
ALTER TABLE "palito"."memberships" ADD CONSTRAINT "memberships_organization_id_organization_kind_fkey" FOREIGN KEY ("organization_id", "organization_kind") REFERENCES "palito"."organizations"("id", "kind") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "palito"."memberships" ADD CONSTRAINT "memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "palito"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "palito"."vet_credentials" ADD CONSTRAINT "vet_credentials_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "palito"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "palito"."vet_credentials" ADD CONSTRAINT "vet_credentials_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "palito"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "palito"."farms" ADD CONSTRAINT "farms_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "palito"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "palito"."farm_memberships" ADD CONSTRAINT "farm_memberships_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "palito"."farms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "palito"."farm_memberships" ADD CONSTRAINT "farm_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "palito"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "palito"."animals" ADD CONSTRAINT "animals_farm_id_owner_id_fkey" FOREIGN KEY ("farm_id", "owner_id") REFERENCES "palito"."farms"("id", "owner_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "palito"."ownership_history" ADD CONSTRAINT "ownership_history_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "palito"."animals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "palito"."ownership_history" ADD CONSTRAINT "ownership_history_from_owner_id_fkey" FOREIGN KEY ("from_owner_id") REFERENCES "palito"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "palito"."ownership_history" ADD CONSTRAINT "ownership_history_to_owner_id_fkey" FOREIGN KEY ("to_owner_id") REFERENCES "palito"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "palito"."valuations" ADD CONSTRAINT "valuations_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "palito"."animals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "palito"."valuations" ADD CONSTRAINT "valuations_owner_at_assessment_id_fkey" FOREIGN KEY ("owner_at_assessment_id") REFERENCES "palito"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "palito"."valuations" ADD CONSTRAINT "valuations_assessor_id_fkey" FOREIGN KEY ("assessor_id") REFERENCES "palito"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "palito"."valuations" ADD CONSTRAINT "valuations_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "palito"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "palito"."appointments" ADD CONSTRAINT "appointments_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "palito"."animals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "palito"."appointments" ADD CONSTRAINT "appointments_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "palito"."farms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "palito"."appointments" ADD CONSTRAINT "appointments_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "palito"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "palito"."appointments" ADD CONSTRAINT "appointments_vet_id_fkey" FOREIGN KEY ("vet_id") REFERENCES "palito"."vet_credentials"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "palito"."health_records" ADD CONSTRAINT "health_records_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "palito"."animals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "palito"."health_records" ADD CONSTRAINT "health_records_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "palito"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "palito"."health_records" ADD CONSTRAINT "health_records_vet_id_fkey" FOREIGN KEY ("vet_id") REFERENCES "palito"."vet_credentials"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "palito"."health_records" ADD CONSTRAINT "health_records_appointment_id_animal_id_vet_id_fkey" FOREIGN KEY ("appointment_id", "animal_id", "vet_id") REFERENCES "palito"."appointments"("id", "animal_id", "vet_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "palito"."health_records" ADD CONSTRAINT "health_records_amends_id_animal_id_fkey" FOREIGN KEY ("amends_id", "animal_id") REFERENCES "palito"."health_records"("id", "animal_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "palito"."prescriptions" ADD CONSTRAINT "prescriptions_record_id_animal_id_vet_id_fkey" FOREIGN KEY ("record_id", "animal_id", "vet_id") REFERENCES "palito"."health_records"("id", "animal_id", "vet_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "palito"."prescription_items" ADD CONSTRAINT "prescription_items_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "palito"."prescriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
COMMIT;
