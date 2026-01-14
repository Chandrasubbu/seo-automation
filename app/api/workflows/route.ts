import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { schedulerService } from "@/lib/services/scheduler"

export async function GET(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const workflows = await prisma.workflow.findMany({
            where: { userId: session.user.id },
            include: { _count: { select: { runs: true } } },
            orderBy: { updatedAt: 'desc' }
        })

        return NextResponse.json(workflows)
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const body = await req.json()
        const { name, schedule, steps, projectId } = body

        if (!name || !steps || steps.length === 0) {
            return NextResponse.json({ error: "Workflow name and at least one step are required" }, { status: 400 })
        }

        // Verify project ownership if projectId is provided
        if (projectId) {
            const project = await prisma.seoProject.findUnique({
                where: { id: projectId }
            })
            if (!project || project.userId !== session.user.id) {
                return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 403 })
            }
        }

        const workflow = await prisma.workflow.create({
            data: {
                userId: session.user.id,
                projectId: projectId || null,
                name,
                schedule,
                isActive: !!schedule,
                steps: {
                    create: steps.map((step: any, idx: number) => ({
                        name: step.name,
                        type: step.type,
                        config: step.config || {},
                        order: idx + 1
                    }))
                }
            }
        })

        // Register with scheduler if active
        if (workflow.isActive && workflow.schedule) {
            schedulerService.scheduleWorkflow(workflow.id, workflow.schedule)
        }

        return NextResponse.json(workflow)
    } catch (error) {
        console.error("Create workflow error", error)
        return NextResponse.json({ error: "Failed to create workflow" }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const body = await req.json()
        const { id, name, schedule, projectId, steps, enabled } = body

        if (!id) return NextResponse.json({ error: "Workflow ID is required" }, { status: 400 })

        // Verify ownership
        const existingWorkflow = await prisma.workflow.findUnique({
            where: { id }
        })

        if (!existingWorkflow || existingWorkflow.userId !== session.user.id) {
            return NextResponse.json({ error: "Workflow not found or unauthorized" }, { status: 403 })
        }

        // If only updating toggle status (backward compatibility)
        if (enabled !== undefined && !name && !steps) {
            const workflow = await prisma.workflow.update({
                where: { id },
                data: { isActive: enabled }
            })
            return NextResponse.json(workflow)
        }

        // Full workflow update
        if (!name || (steps && steps.length === 0)) {
            return NextResponse.json({ error: "Workflow name and at least one step are required" }, { status: 400 })
        }

        // Verify project ownership if projectId is provided
        if (projectId) {
            const project = await prisma.seoProject.findUnique({
                where: { id: projectId }
            })
            if (!project || project.userId !== session.user.id) {
                return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 403 })
            }
        }

        // Update workflow
        const workflow = await prisma.workflow.update({
            where: { id },
            data: {
                name,
                schedule,
                projectId: projectId || null,
                isActive: !!schedule
            }
        })

        // Update steps if provided
        if (steps) {
            // Delete existing steps
            await prisma.workflowStep.deleteMany({
                where: { workflowId: id }
            })

            // Create new steps
            await prisma.workflowStep.createMany({
                data: steps.map((step: any, idx: number) => ({
                    workflowId: id,
                    name: step.name,
                    type: step.type,
                    config: step.config || {},
                    order: idx + 1
                }))
            })
        }

        // Fetch updated workflow with steps
        const updatedWorkflow = await prisma.workflow.findUnique({
            where: { id },
            include: {
                steps: {
                    orderBy: { order: 'asc' }
                }
            }
        })

        return NextResponse.json(updatedWorkflow)
    } catch (error) {
        console.error("Update workflow error", error)
        return NextResponse.json({ error: "Failed to update workflow" }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")

        if (!id) return NextResponse.json({ error: "Workflow ID is required" }, { status: 400 })

        // Verify ownership
        const workflow = await prisma.workflow.findUnique({
            where: { id }
        })

        if (!workflow || workflow.userId !== session.user.id) {
            return NextResponse.json({ error: "Workflow not found or unauthorized" }, { status: 404 })
        }

        // Delete workflow (cascades to steps and runs)
        await prisma.workflow.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Delete workflow error", error)
        return NextResponse.json({ error: "Failed to delete workflow" }, { status: 500 })
    }
}
