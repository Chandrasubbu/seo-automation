import { NextRequest, NextResponse } from "next/server"
import { analyticsService } from "@/lib/analytics-service"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
    try {
        const session = await auth()
        const searchParams = req.nextUrl.searchParams

        // Parse date range
        const startDate = searchParams.get("startDate")
        const endDate = searchParams.get("endDate")

        const dateRange = startDate && endDate
            ? {
                start: new Date(startDate),
                end: new Date(endDate),
            }
            : undefined

        // Get analytics data
        const data = await analyticsService.getOverviewAnalytics(
            session?.user?.id,
            dateRange
        )

        return NextResponse.json(data)
    } catch (error) {
        console.error("Analytics API error:", error)
        return NextResponse.json(
            { error: "Failed to fetch analytics data" },
            { status: 500 }
        )
    }
}
