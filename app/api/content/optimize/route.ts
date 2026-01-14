import { NextRequest, NextResponse } from "next/server"
import { contentOptimizer } from "@/lib/content-optimizer"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { content, targetKeyword, focusAreas } = body

        if (!content || !targetKeyword) {
            return NextResponse.json(
                { error: "Content and target keyword are required" },
                { status: 400 }
            )
        }

        const defaultFocusAreas = [
            "keyword optimization",
            "readability",
            "engagement",
            "structure",
        ]

        const optimizedContent = await contentOptimizer.optimizeContent(
            content,
            targetKeyword,
            focusAreas || defaultFocusAreas
        )

        return NextResponse.json({
            originalContent: content,
            optimizedContent,
            targetKeyword,
        })
    } catch (error) {
        console.error("Content optimization error:", error)
        return NextResponse.json(
            { error: "Failed to optimize content" },
            { status: 500 }
        )
    }
}
