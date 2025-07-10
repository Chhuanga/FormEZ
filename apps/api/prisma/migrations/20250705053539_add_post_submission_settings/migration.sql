-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "postSubmissionSettings" JSONB NOT NULL DEFAULT '{"type":"message","message":"Thanks for your submission!"}';
