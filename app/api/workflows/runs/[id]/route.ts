import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { id } = await params

        // Fetch the run and verify ownership through workflow
        const run = await prisma.workflowRun.findUnique({
            where: { id },
            include: {
                workflow: {
                    include: {
                        steps: {
                            orderBy: { order: 'asc' }
                        }
                    }
                }
            }
        })

        if (!run) {
            return NextResponse.json({ error: "Run not found" }, { status: 404 })
        }

        // Verify user owns this workflow
        if (run.workflow.userId !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        return NextResponse.json(run)
    } catch (error) {
        console.error("Get workflow run error", error)
        return NextResponse.json({ error: "Failed to fetch workflow run" }, { status: 500 })
    }
}
