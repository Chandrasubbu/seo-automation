-- CreateTable
CREATE TABLE "SeoProject" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "targetKeyword" TEXT,
    "clientUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoProjectWebsite" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'competitor',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoProjectWebsite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoProjectAudit" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "gapAnalysis" JSONB,
    "recommendations" JSONB,
    "topPriorities" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeoProjectAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SeoProject_userId_idx" ON "SeoProject"("userId");

-- CreateIndex
CREATE INDEX "SeoProject_status_idx" ON "SeoProject"("status");

-- CreateIndex
CREATE INDEX "SeoProject_createdAt_idx" ON "SeoProject"("createdAt");

-- CreateIndex
CREATE INDEX "SeoProjectWebsite_projectId_idx" ON "SeoProjectWebsite"("projectId");

-- CreateIndex
CREATE INDEX "SeoProjectWebsite_url_idx" ON "SeoProjectWebsite"("url");

-- CreateIndex
CREATE UNIQUE INDEX "SeoProjectWebsite_projectId_url_key" ON "SeoProjectWebsite"("projectId", "url");

-- CreateIndex
CREATE INDEX "SeoProjectAudit_projectId_idx" ON "SeoProjectAudit"("projectId");

-- AddForeignKey
ALTER TABLE "SeoProject" ADD CONSTRAINT "SeoProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeoProjectWebsite" ADD CONSTRAINT "SeoProjectWebsite_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "SeoProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeoProjectAudit" ADD CONSTRAINT "SeoProjectAudit_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "SeoProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
