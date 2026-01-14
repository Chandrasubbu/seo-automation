"use client"

import { useEffect, useState } from "react"
import { PerformanceChart } from "@/components/analytics/PerformanceChart"
import { TopPagesTable } from "@/components/analytics/TopPagesTable"
import { TopQueriesTable } from "@/components/analytics/TopQueriesTable"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, BarChart2, MousePointerClick, Eye, Target } from "lucide-react"

export default function AnalyticsDashboard() {
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)
    const [data, setData] = useState<any>(null)

    const fetchData = async () => {
        try {
            setLoading(true)
            const res = await fetch("/api/analytics/dashboard?days=30")
            const json = await res.json()
            setData(json)
        } catch (error) {
            console.error("Failed to fetch analytics:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSync = async () => {
        try {
            setSyncing(true)
            await fetch("/api/analytics/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}), // Use defaults
            })
            await fetchData() // Refresh data
        } catch (error) {
            console.error("Sync failed:", error)
        } finally {
            setSyncing(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Performance Overview</h2>
                <Button onClick={handleSync} disabled={syncing}>
                    {syncing ? (
                        <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Syncing...
                        </>
                    ) : (
                        <>
                            <ArrowUpRight className="mr-2 h-4 w-4" />
                            Sync GSC Data
                        </>
                    )}
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                        <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data?.overview?.totalClicks.toLocaleString() || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Last 30 days
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data?.overview?.totalImpressions.toLocaleString() || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Last 30 days
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. CTR</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data?.overview?.avgCtr.toFixed(2) || 0}%</div>
                        <p className="text-xs text-muted-foreground">
                            Last 30 days
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Position</CardTitle>
                        <BarChart2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data?.overview?.avgPosition.toFixed(1) || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Last 30 days
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Chart */}
            <PerformanceChart data={data?.chartData || []} />

            {/* Details Tables */}
            <div className="grid gap-4 md:grid-cols-2">
                <TopPagesTable data={data?.topPages || []} />
                <TopQueriesTable data={data?.topQueries || []} />
            </div>
        </div>
    )
}
