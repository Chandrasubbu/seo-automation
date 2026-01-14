import { NextRequest, NextResponse } from "next/server"
import { backlinkAnalyzerService } from "@/lib/services/backlink-analyzer"
import { prisma } from "@/lib/db"

/**
 * POST /api/backlinks/analyze
 * Run backlink analysis on a domain
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { domain, userId, region } = body

        if (!domain) {
            return NextResponse.json(
                { error: "Domain is required" },
                { status: 400 }
            )
        }

        // Run backlink analysis
        const result = await backlinkAnalyzerService.analyzeBacklinks(domain, region)

        // Try to save to database
        let savedId: string | null = null
        try {
            if (prisma.backlinkAnalysis) {
                const saved = await prisma.backlinkAnalysis.create({
                    data: {
                        userId: userId || null,
                        domain: result.domain,
                        region: result.region || null,
                        healthScore: result.healthScore,
                        toxicScore: result.toxicScore,
                        qualityScore: result.qualityScore,
                        totalBacklinks: result.totalBacklinks,
                        dofollowCount: result.dofollowCount,
                        nofollowCount: result.nofollowCount,
                        toxicLinks: JSON.parse(JSON.stringify(result.toxicLinks)),
                        qualityMetrics: JSON.parse(JSON.stringify(result.qualityMetrics)),
                        lostLinks: JSON.parse(JSON.stringify(result.lostLinks)),
                        anchorText: JSON.parse(JSON.stringify(result.anchorText)),
                        topReferrers: JSON.parse(JSON.stringify(result.topReferrers))
                    }
                })
                savedId = saved.id
            }
        } catch (dbError) {
            console.warn("Could not save backlink analysis:", dbError)
        }

        return NextResponse.json({
            id: savedId,
            ...result
        })
    } catch (error) {
        console.error("Backlink analysis error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to analyze backlinks" },
            { status: 500 }
        )
    }
}
