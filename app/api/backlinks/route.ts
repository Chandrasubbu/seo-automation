import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

/**
 * GET /api/backlinks
 * List all backlink analyses
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const userId = searchParams.get("userId")
        const limit = parseInt(searchParams.get("limit") || "20")

        const where: { userId?: string } = {}
        if (userId) where.userId = userId

        let analyses: any[] = []
        try {
            if (prisma.backlinkAnalysis) {
                analyses = await prisma.backlinkAnalysis.findMany({
                    where,
                    orderBy: { createdAt: "desc" },
                    take: limit,
                    select: {
                        id: true,
                        domain: true,
                        healthScore: true,
                        toxicScore: true,
                        qualityScore: true,
                        totalBacklinks: true,
                        createdAt: true
                    }
                })
            }
        } catch {
            // Model not available
        }

        return NextResponse.json({ analyses })
    } catch (error) {
        console.error("Error fetching backlink analyses:", error)
        return NextResponse.json(
            { error: "Failed to fetch analyses" },
            { status: 500 }
        )
    }
}
