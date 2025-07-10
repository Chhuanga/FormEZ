-- CreateTable
CREATE TABLE "SubmissionAnalysis" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "submissionId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "sentiment" TEXT,
    "summary" TEXT,
    "rawOutput" JSONB,

    CONSTRAINT "SubmissionAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubmissionAnalysis_submissionId_key" ON "SubmissionAnalysis"("submissionId");

-- AddForeignKey
ALTER TABLE "SubmissionAnalysis" ADD CONSTRAINT "SubmissionAnalysis_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "FormSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
