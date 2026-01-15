import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
    try {
        // Try to query the database
        const userCount = await prisma.user.count()
        return NextResponse.json({
            status: "ok",
            message: "Database connection successful",
            userCount
        })
    } catch (error: any) {
        return NextResponse.json({
            status: "error",
            message: "Database connection failed",
            error: error.message,
            code: error.code
        }, { status: 500 })
    }
}
