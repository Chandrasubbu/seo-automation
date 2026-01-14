import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { backlinkAnalyzerService } from "@/lib/services/backlink-analyzer"

/**
 * GET /api/backlinks/[id]
 * Get a specific backlink analysis
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        let analysis = null
        try {
            if (prisma.backlinkAnalysis) {
                analysis = await prisma.backlinkAnalysis.findUnique({
                    where: { id }
                })
            }
        } catch {
            // Model not available
        }

        if (!analysis) {
            return NextResponse.json(
                { error: "Analysis not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(analysis)
    } catch (error) {
        console.error("Error fetching analysis:", error)
        return NextResponse.json(
            { error: "Failed to fetch analysis" },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/backlinks/[id]
 * Delete a specific backlink analysis
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        try {
            if (prisma.backlinkAnalysis) {
                await prisma.backlinkAnalysis.delete({
                    where: { id }
                })
            }
        } catch {
            // Model not available or record not found
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting analysis:", error)
        return NextResponse.json(
            { error: "Failed to delete analysis" },
            { status: 500 }
        )
    }
}

/**
 * POST /api/backlinks/[id]/disavow
 * Generate disavow file for a specific analysis
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await req.json()
        const { toxicLinks } = body

        if (!toxicLinks || !Array.isArray(toxicLinks)) {
            return NextResponse.json(
                { error: "Toxic links array is required" },
                { status: 400 }
            )
        }

        const disavowContent = backlinkAnalyzerService.generateDisavowFile(toxicLinks)

        return NextResponse.json({
            content: disavowContent,
            filename: `disavow-${id}.txt`
        })
    } catch (error) {
        console.error("Error generating disavow file:", error)
        return NextResponse.json(
            { error: "Failed to generate disavow file" },
            { status: 500 }
        )
    }
}
