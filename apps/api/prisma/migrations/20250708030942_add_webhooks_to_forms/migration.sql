/*
  Warnings:

  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Integration` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "Integration" DROP CONSTRAINT "Integration_accountId_fkey";

-- DropForeignKey
ALTER TABLE "Integration" DROP CONSTRAINT "Integration_formId_fkey";

-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "webhooks" JSONB NOT NULL DEFAULT '[]';

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "Integration";

-- DropEnum
DROP TYPE "IntegrationType";
