-- CreateTable
CREATE TABLE "TechnicalAudit" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "projectId" TEXT,
    "url" TEXT NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "crawlabilityScore" DOUBLE PRECISION NOT NULL,
    "speedScore" DOUBLE PRECISION NOT NULL,
    "mobileScore" DOUBLE PRECISION NOT NULL,
    "securityScore" DOUBLE PRECISION NOT NULL,
    "structureScore" DOUBLE PRECISION NOT NULL,
    "contentScore" DOUBLE PRECISION NOT NULL,
    "uxScore" DOUBLE PRECISION NOT NULL,
    "crawlability" JSONB NOT NULL,
    "speed" JSONB NOT NULL,
    "mobile" JSONB NOT NULL,
    "security" JSONB NOT NULL,
    "structure" JSONB NOT NULL,
    "content" JSONB NOT NULL,
    "ux" JSONB NOT NULL,
    "issues" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TechnicalAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BacklinkAnalysis" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "domain" TEXT NOT NULL,
    "region" TEXT,
    "healthScore" DOUBLE PRECISION NOT NULL,
    "toxicScore" DOUBLE PRECISION NOT NULL,
    "qualityScore" DOUBLE PRECISION NOT NULL,
    "totalBacklinks" INTEGER NOT NULL,
    "dofollowCount" INTEGER NOT NULL DEFAULT 0,
    "nofollowCount" INTEGER NOT NULL DEFAULT 0,
    "toxicLinks" JSONB NOT NULL,
    "qualityMetrics" JSONB NOT NULL,
    "lostLinks" JSONB NOT NULL,
    "anchorText" JSONB NOT NULL,
    "topReferrers" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BacklinkAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BacklinkOpportunity" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "domain" TEXT NOT NULL,
    "region" TEXT,
    "unlinkedMentions" JSONB NOT NULL,
    "brokenLinkTargets" JSONB NOT NULL,
    "competitorGaps" JSONB NOT NULL,
    "totalOpportunities" INTEGER NOT NULL DEFAULT 0,
    "contactedCount" INTEGER NOT NULL DEFAULT 0,
    "acquiredCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BacklinkOpportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoogleSearchKeywords" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "workflowId" TEXT,
    "clientUrl" TEXT NOT NULL,
    "competitorUrls" TEXT[],
    "keywords" JSONB NOT NULL,
    "totalKeywords" INTEGER NOT NULL DEFAULT 0,
    "source" TEXT NOT NULL DEFAULT 'google_search',
    "region" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "highPriority" JSONB,
    "mediumPriority" JSONB,
    "lowPriority" JSONB,
    "clientCoverage" INTEGER,
    "competitorGaps" JSONB,
    "opportunities" JSONB,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleSearchKeywords_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TechnicalAudit_userId_idx" ON "TechnicalAudit"("userId");

-- CreateIndex
CREATE INDEX "TechnicalAudit_projectId_idx" ON "TechnicalAudit"("projectId");

-- CreateIndex
CREATE INDEX "TechnicalAudit_url_idx" ON "TechnicalAudit"("url");

-- CreateIndex
CREATE INDEX "TechnicalAudit_createdAt_idx" ON "TechnicalAudit"("createdAt");

-- CreateIndex
CREATE INDEX "BacklinkAnalysis_userId_idx" ON "BacklinkAnalysis"("userId");

-- CreateIndex
CREATE INDEX "BacklinkAnalysis_domain_idx" ON "BacklinkAnalysis"("domain");

-- CreateIndex
CREATE INDEX "BacklinkAnalysis_createdAt_idx" ON "BacklinkAnalysis"("createdAt");

-- CreateIndex
CREATE INDEX "BacklinkOpportunity_userId_idx" ON "BacklinkOpportunity"("userId");

-- CreateIndex
CREATE INDEX "BacklinkOpportunity_domain_idx" ON "BacklinkOpportunity"("domain");

-- CreateIndex
CREATE INDEX "BacklinkOpportunity_createdAt_idx" ON "BacklinkOpportunity"("createdAt");

-- CreateIndex
CREATE INDEX "GoogleSearchKeywords_userId_idx" ON "GoogleSearchKeywords"("userId");

-- CreateIndex
CREATE INDEX "GoogleSearchKeywords_projectId_idx" ON "GoogleSearchKeywords"("projectId");

-- CreateIndex
CREATE INDEX "GoogleSearchKeywords_createdAt_idx" ON "GoogleSearchKeywords"("createdAt");

-- CreateIndex
CREATE INDEX "GoogleSearchKeywords_status_idx" ON "GoogleSearchKeywords"("status");

-- AddForeignKey
ALTER TABLE "TechnicalAudit" ADD CONSTRAINT "TechnicalAudit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicalAudit" ADD CONSTRAINT "TechnicalAudit_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "SeoProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BacklinkAnalysis" ADD CONSTRAINT "BacklinkAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BacklinkOpportunity" ADD CONSTRAINT "BacklinkOpportunity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleSearchKeywords" ADD CONSTRAINT "GoogleSearchKeywords_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleSearchKeywords" ADD CONSTRAINT "GoogleSearchKeywords_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "SeoProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
