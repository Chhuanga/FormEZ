-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "isTemplate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "templateCategory" TEXT;
