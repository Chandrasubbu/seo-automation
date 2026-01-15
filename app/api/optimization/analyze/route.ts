import { NextRequest, NextResponse } from "next/server"
import { optimizationEngine } from "@/lib/services/optimization-engine"
import { z } from "zod"

const analyzeSchema = z.object({
    content: z.string().min(10, "Content must be at least 10 characters"),
    targetKeyword: z.string().min(1, "Target keyword is required"),
})

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const result = analyzeSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
        }

        const { content, targetKeyword } = result.data

        // 1. Run Analysis
        const analysis = optimizationEngine.analyzeSXO(content, targetKeyword)

        // 2. Generate Suggestions
        const suggestions = await optimizationEngine.generateSuggestions(content, targetKeyword)

        return NextResponse.json({
            ...analysis,
            suggestions
        })

    } catch (error) {
        console.error("Analysis error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
