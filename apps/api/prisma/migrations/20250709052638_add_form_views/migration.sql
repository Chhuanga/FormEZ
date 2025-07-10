/*
  Warnings:

  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FormAnalysis` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Integration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SubmissionAnalysis` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "FormAnalysis" DROP CONSTRAINT "FormAnalysis_formId_fkey";

-- DropForeignKey
ALTER TABLE "Integration" DROP CONSTRAINT "Integration_accountId_fkey";

-- DropForeignKey
ALTER TABLE "Integration" DROP CONSTRAINT "Integration_formId_fkey";

-- DropForeignKey
ALTER TABLE "SubmissionAnalysis" DROP CONSTRAINT "SubmissionAnalysis_submissionId_fkey";

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "FormAnalysis";

-- DropTable
DROP TABLE "Integration";

-- DropTable
DROP TABLE "SubmissionAnalysis";

-- DropEnum
DROP TYPE "IntegrationType";

-- CreateTable
CREATE TABLE "FormView" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "formId" TEXT NOT NULL,

    CONSTRAINT "FormView_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FormView" ADD CONSTRAINT "FormView_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
