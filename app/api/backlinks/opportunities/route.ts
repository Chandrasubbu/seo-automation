import { NextRequest, NextResponse } from "next/server"
import { backlinkOpportunitiesService } from "@/lib/services/backlink-opportunities"
import { prisma } from "@/lib/db"

/**
 * POST /api/backlinks/opportunities
 * Generate backlink opportunities for a domain
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { domain, brandName, competitors, userId, region } = body

        if (!domain) {
            return NextResponse.json(
                { error: "Domain is required" },
                { status: 400 }
            )
        }

        // Generate opportunities
        const result = await backlinkOpportunitiesService.generateOpportunities(
            domain,
            brandName,
            competitors,
            region
        )

        // Try to save to database
        let savedId: string | null = null
        try {
            if (prisma.backlinkOpportunity) {
                const saved = await prisma.backlinkOpportunity.create({
                    data: {
                        userId: userId || null,
                        domain: result.domain,
                        region: result.region || null,
                        unlinkedMentions: JSON.parse(JSON.stringify(result.unlinkedMentions)),
                        brokenLinkTargets: JSON.parse(JSON.stringify(result.brokenLinkTargets)),
                        competitorGaps: JSON.parse(JSON.stringify(result.competitorGaps)),
                        totalOpportunities: result.totalOpportunities
                    }
                })
                savedId = saved.id
            }
        } catch (dbError) {
            console.warn("Could not save backlink opportunities:", dbError)
        }

        return NextResponse.json({
            id: savedId,
            ...result
        })
    } catch (error) {
        console.error("Backlink opportunities error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to generate opportunities" },
            { status: 500 }
        )
    }
}
