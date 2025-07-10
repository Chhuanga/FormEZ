/*
  Warnings:

  - You are about to drop the column `isTemplate` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `templateCategory` on the `Form` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "IntegrationType" ADD VALUE 'MAILCHIMP';
ALTER TYPE "IntegrationType" ADD VALUE 'WEBHOOK';

-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_submissionId_fkey";

-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_answerId_fkey";

-- DropForeignKey
ALTER TABLE "FormSubmission" DROP CONSTRAINT "FormSubmission_formId_fkey";

-- AlterTable
ALTER TABLE "Form" DROP COLUMN "isTemplate",
DROP COLUMN "templateCategory";

-- AlterTable
ALTER TABLE "Integration" ADD COLUMN     "isEnabled" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "accountId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "FormSubmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "Answer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
