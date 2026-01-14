import { NextRequest, NextResponse } from "next/server"
import { optimizationEngine } from "@/lib/services/optimization-engine"
import { z } from "zod"

const fixSchema = z.object({
    content: z.string(),
    suggestionId: z.string(),
    instruction: z.string().optional(),
})

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const result = fixSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 })
        }

        const { content, suggestionId, instruction } = result.data

        // Apply fix
        const updatedContent = await optimizationEngine.applyFix(
            content,
            suggestionId,
            instruction || ""
        )

        return NextResponse.json({
            updatedContent,
            success: true
        })

    } catch (error) {
        console.error("Auto-fix error:", error)
        return NextResponse.json({ error: "Failed to apply fix" }, { status: 500 })
    }
}
