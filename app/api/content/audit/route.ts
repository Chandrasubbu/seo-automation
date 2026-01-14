import { NextRequest, NextResponse } from "next/server"
import { contentOptimizer } from "@/lib/content-optimizer"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { content, targetKeyword, title, metaDescription } = body

        if (!content) {
            return NextResponse.json(
                { error: "Content is required" },
                { status: 400 }
            )
        }

        // Run content audit
        const auditResult = await contentOptimizer.auditContent(
            content,
            targetKeyword,
            title,
            metaDescription
        )

        // Get AI suggestions if requested
        let aiSuggestions: string[] = []
        if (body.includeAISuggestions && targetKeyword) {
            aiSuggestions = await contentOptimizer.getAISuggestions(
                content,
                targetKeyword,
                auditResult
            )
        }

        return NextResponse.json({
            ...auditResult,
            aiSuggestions,
        })
    } catch (error) {
        console.error("Content audit error:", error)
        return NextResponse.json(
            { error: "Failed to audit content" },
            { status: 500 }
        )
    }
}
