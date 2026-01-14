import { prisma } from "./db"

export interface AnalyticsData {
    totalAnalyses: number
    totalClusters: number
    totalKeywords: number
    totalSerpAnalyses: number
    avgQualityScore: number
    avgEeatScore: number
    avgSeoScore: number
    recentActivity: {
        date: string
        analyses: number
        clusters: number
        keywords: number
    }[]
    topKeywords: {
        keyword: string
        count: number
    }[]
    qualityDistribution: {
        excellent: number
        good: number
        average: number
        poor: number
    }
}

export interface DateRange {
    start: Date
    end: Date
}

/**
 * Analytics Service
 * Aggregates metrics from various data sources for the dashboard
 */
export class AnalyticsService {
    /**
     * Get overview analytics data
     */
    async getOverviewAnalytics(
        userId?: string,
        dateRange?: DateRange
    ): Promise<AnalyticsData> {
        const where = {
            ...(userId ? { userId } : {}),
            ...(dateRange
                ? {
                    createdAt: {
                        gte: dateRange.start,
                        lte: dateRange.end,
                    },
                }
                : {}),
        }

        // Get counts in parallel
        const [
            totalAnalyses,
            totalClusters,
            totalKeywords,
            totalSerpAnalyses,
            qualityScores,
            recentAnalyses,
            recentClusters,
            recentKeywords,
            topKeywords,
        ] = await Promise.all([
            prisma.analysisResult.count({ where }),
            prisma.topicCluster.count({ where }),
            prisma.keywordResearch.count({ where }),
            prisma.serpAnalysis.count({ where }),
            prisma.contentQuality.aggregate({
                where,
                _avg: {
                    eeAtScore: true,
                    seoScore: true,
                    readabilityScore: true,
                    completenessScore: true,
                },
            }),
            this.getRecentActivityByType("analysis", where),
            this.getRecentActivityByType("cluster", where),
            this.getRecentActivityByType("keyword", where),
            this.getTopKeywords(where),
        ])

        // Calculate quality distribution
        const qualityDistribution = await this.getQualityDistribution(where)

        // Calculate average quality score
        const avgQualityScore =
            (qualityScores._avg.seoScore || 0) * 0.4 +
            (qualityScores._avg.eeAtScore || 0) * 0.3 +
            (qualityScores._avg.readabilityScore || 0) * 0.15 +
            (qualityScores._avg.completenessScore || 0) * 0.15

        // Merge recent activity
        const recentActivity = this.mergeRecentActivity(
            recentAnalyses,
            recentClusters,
            recentKeywords
        )

        return {
            totalAnalyses,
            totalClusters,
            totalKeywords,
            totalSerpAnalyses,
            avgQualityScore: Math.round(avgQualityScore * 10) / 10,
            avgEeatScore: Math.round((qualityScores._avg.eeAtScore || 0) * 10) / 10,
            avgSeoScore: Math.round((qualityScores._avg.seoScore || 0) * 10) / 10,
            recentActivity,
            topKeywords,
            qualityDistribution,
        }
    }

    /**
     * Get recent activity grouped by date for a specific type
     */
    private async getRecentActivityByType(
        type: "analysis" | "cluster" | "keyword",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        where: any
    ): Promise<{ date: string; count: number }[]> {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const model =
            type === "analysis"
                ? prisma.analysisResult
                : type === "cluster"
                    ? prisma.topicCluster
                    : prisma.keywordResearch

        // @ts-expect-error - dynamic model access
        const results = await model.groupBy({
            by: ["createdAt"],
            where: {
                ...where,
                createdAt: { gte: thirtyDaysAgo },
            },
            _count: true,
        })

        // Group by date (not timestamp)
        const grouped = results.reduce(
            (acc: Record<string, number>, item: { createdAt: Date; _count: number }) => {
                const date = item.createdAt.toISOString().split("T")[0]
                acc[date] = (acc[date] || 0) + item._count
                return acc
            },
            {}
        )

        return Object.entries(grouped).map(([date, count]) => ({
            date,
            count: count as number,
        }))
    }

    /**
     * Merge activity from different types into a unified timeline
     */
    private mergeRecentActivity(
        analyses: { date: string; count: number }[],
        clusters: { date: string; count: number }[],
        keywords: { date: string; count: number }[]
    ): AnalyticsData["recentActivity"] {
        const merged: Record<
            string,
            { analyses: number; clusters: number; keywords: number }
        > = {}

        // Initialize last 30 days
        for (let i = 0; i < 30; i++) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            const dateStr = date.toISOString().split("T")[0]
            merged[dateStr] = { analyses: 0, clusters: 0, keywords: 0 }
        }

        analyses.forEach((a) => {
            if (merged[a.date]) merged[a.date].analyses = a.count
        })
        clusters.forEach((c) => {
            if (merged[c.date]) merged[c.date].clusters = c.count
        })
        keywords.forEach((k) => {
            if (merged[k.date]) merged[k.date].keywords = k.count
        })

        return Object.entries(merged)
            .map(([date, data]) => ({ date, ...data }))
            .sort((a, b) => a.date.localeCompare(b.date))
    }

    /**
     * Get top keywords by frequency
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async getTopKeywords(where: any): Promise<{ keyword: string; count: number }[]> {
        const results = await prisma.analysisResult.groupBy({
            by: ["keyword"],
            where,
            _count: { keyword: true },
            orderBy: { _count: { keyword: "desc" } },
            take: 10,
        })

        return results.map((r) => ({
            keyword: r.keyword,
            count: r._count.keyword,
        }))
    }

    /**
     * Get quality score distribution
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async getQualityDistribution(where: any): Promise<AnalyticsData["qualityDistribution"]> {
        const qualities = await prisma.contentQuality.findMany({
            where,
            select: { seoScore: true },
        })

        const distribution = { excellent: 0, good: 0, average: 0, poor: 0 }

        qualities.forEach((q) => {
            if (q.seoScore >= 80) distribution.excellent++
            else if (q.seoScore >= 60) distribution.good++
            else if (q.seoScore >= 40) distribution.average++
            else distribution.poor++
        })

        return distribution
    }

    /**
     * Get ranking trends for keywords
     */
    async getRankingTrends(
        keyword: string,
        userId?: string
    ): Promise<{ date: string; position: number }[]> {
        const results = await prisma.serpAnalysis.findMany({
            where: {
                keyword,
                ...(userId ? { userId } : {}),
            },
            orderBy: { createdAt: "asc" },
            take: 30,
        })

        return results.map((r) => ({
            date: r.createdAt.toISOString().split("T")[0],
            position: Array.isArray(r.rankings) ? (r.rankings as { position?: number }[])[0]?.position || 0 : 0,
        }))
    }
}

export const analyticsService = new AnalyticsService()
