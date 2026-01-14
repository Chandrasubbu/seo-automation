import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { workflowEngine } from "@/lib/services/workflow-engine"

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { id } = await params

        const workflow = await prisma.workflow.findUnique({
            where: { id, userId: session.user.id }
        })

        if (!workflow) {
            return NextResponse.json({ error: "Workflow not found" }, { status: 404 })
        }

        const runId = await workflowEngine.executeWorkflow(id)

        return NextResponse.json({ success: true, runId })
    } catch (error) {
        console.error("Run workflow error", error)
        return NextResponse.json({ error: "Failed to run workflow" }, { status: 500 })
    }
}
