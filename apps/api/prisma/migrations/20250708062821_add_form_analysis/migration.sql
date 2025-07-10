-- AlterTable
ALTER TABLE "SubmissionAnalysis" ADD COLUMN     "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "FormAnalysis" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "formId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "overallSentiment" JSONB NOT NULL,
    "themes" JSONB NOT NULL,
    "suggestions" TEXT[],
    "rawOutput" JSONB,

    CONSTRAINT "FormAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FormAnalysis_formId_key" ON "FormAnalysis"("formId");

-- AddForeignKey
ALTER TABLE "FormAnalysis" ADD CONSTRAINT "FormAnalysis_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;
