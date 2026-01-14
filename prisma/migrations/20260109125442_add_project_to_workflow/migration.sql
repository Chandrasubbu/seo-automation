-- AlterTable
ALTER TABLE "Workflow" ADD COLUMN     "projectId" TEXT;

-- CreateIndex
CREATE INDEX "Workflow_projectId_idx" ON "Workflow"("projectId");

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "SeoProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
