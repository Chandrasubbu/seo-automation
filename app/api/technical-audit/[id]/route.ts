import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

/**
 * GET /api/technical-audit/[id]
 * Get a specific technical audit by ID
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const audit = await prisma.technicalAudit.findUnique({
            where: { id }
        })

        if (!audit) {
            return NextResponse.json(
                { error: "Audit not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(audit)
    } catch (error) {
        console.error("Error fetching audit:", error)
        return NextResponse.json(
            { error: "Failed to fetch audit" },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/technical-audit/[id]
 * Delete a specific technical audit
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        await prisma.technicalAudit.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting audit:", error)
        return NextResponse.json(
            { error: "Failed to delete audit" },
            { status: 500 }
        )
    }
}
