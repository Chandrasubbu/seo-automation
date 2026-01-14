"use client"

import { useState, useEffect } from "react"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
} from "recharts"
import {
    TrendingUp,
    FileText,
    Target,
    Search,
    BarChart3,
    RefreshCw,
    Calendar,
} from "lucide-react"

interface AnalyticsData {
    totalAnalyses: number
    totalClusters: number
    totalKeywords: number
    totalSerpAnalyses: number
    avgQualityScore: number
    avgEeatScore: number
    avgSeoScore: number
    recentActivity: {
        date: string
        analyses: number
        clusters: number
        keywords: number
    }[]
    topKeywords: {
        keyword: string
        count: number
    }[]
    qualityDistribution: {
        excellent: number
        good: number
        average: number
        poor: number
    }
}

const COLORS = ["#8b5cf6", "#ec4899", "#06b6d4", "#f59e0b"]

export function PerformanceDashboard() {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [dateRange, setDateRange] = useState("30d")

    const fetchAnalytics = async () => {
        setLoading(true)
        setError("")

        try {
            const endDate = new Date()
            const startDate = new Date()

            switch (dateRange) {
                case "7d":
                    startDate.setDate(startDate.getDate() - 7)
                    break
                case "30d":
                    startDate.setDate(startDate.getDate() - 30)
                    break
                case "90d":
                    startDate.setDate(startDate.getDate() - 90)
                    break
            }

            const params = new URLSearchParams({
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
            })

            const res = await fetch(`/api/analytics?${params}`)
            if (!res.ok) throw new Error("Failed to fetch analytics")

            const analytics = await res.json()
            setData(analytics)
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAnalytics()
    }, [dateRange])

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="flex items-center gap-3 text-white">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    <span>Loading analytics...</span>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                        onClick={fetchAnalytics}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    const qualityPieData = data
        ? [
            { name: "Excellent", value: data.qualityDistribution.excellent },
            { name: "Good", value: data.qualityDistribution.good },
            { name: "Average", value: data.qualityDistribution.average },
            { name: "Poor", value: data.qualityDistribution.poor },
        ]
        : []

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Performance Dashboard</h1>
                        <p className="text-gray-400 mt-1">Track your SEO performance and content metrics</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1">
                            {["7d", "30d", "90d"].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setDateRange(range)}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${dateRange === range
                                            ? "bg-purple-500 text-white"
                                            : "text-gray-400 hover:text-white"
                                        }`}
                                >
                                    {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={fetchAnalytics}
                            className="p-2 bg-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/20 transition"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Analyses"
                        value={data?.totalAnalyses || 0}
                        icon={<FileText className="w-6 h-6" />}
                        color="purple"
                    />
                    <StatCard
                        title="Topic Clusters"
                        value={data?.totalClusters || 0}
                        icon={<Target className="w-6 h-6" />}
                        color="pink"
                    />
                    <StatCard
                        title="Keywords Tracked"
                        value={data?.totalKeywords || 0}
                        icon={<Search className="w-6 h-6" />}
                        color="cyan"
                    />
                    <StatCard
                        title="SERP Analyses"
                        value={data?.totalSerpAnalyses || 0}
                        icon={<BarChart3 className="w-6 h-6" />}
                        color="amber"
                    />
                </div>

                {/* Score Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <ScoreCard
                        title="Average Quality Score"
                        value={data?.avgQualityScore || 0}
                        maxValue={100}
                        color="#8b5cf6"
                    />
                    <ScoreCard
                        title="E-E-A-T Score"
                        value={data?.avgEeatScore || 0}
                        maxValue={100}
                        color="#ec4899"
                    />
                    <ScoreCard
                        title="SEO Score"
                        value={data?.avgSeoScore || 0}
                        maxValue={100}
                        color="#06b6d4"
                    />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Activity Chart */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-purple-400" />
                            Activity Trends
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data?.recentActivity || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#9ca3af"
                                        fontSize={12}
                                        tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                    />
                                    <YAxis stroke="#9ca3af" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#1f2937",
                                            border: "1px solid #374151",
                                            borderRadius: "8px",
                                        }}
                                        labelStyle={{ color: "#fff" }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="analyses"
                                        stroke="#8b5cf6"
                                        strokeWidth={2}
                                        dot={false}
                                        name="Analyses"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="clusters"
                                        stroke="#ec4899"
                                        strokeWidth={2}
                                        dot={false}
                                        name="Clusters"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="keywords"
                                        stroke="#06b6d4"
                                        strokeWidth={2}
                                        dot={false}
                                        name="Keywords"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Quality Distribution */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-pink-400" />
                            Quality Distribution
                        </h3>
                        <div className="h-64 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={qualityPieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) =>
                                            `${name} ${(percent * 100).toFixed(0)}%`
                                        }
                                        labelLine={false}
                                    >
                                        {qualityPieData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Top Keywords */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Search className="w-5 h-5 text-cyan-400" />
                        Top Keywords
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data?.topKeywords || []}
                                layout="vertical"
                                margin={{ left: 100 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                                <YAxis
                                    type="category"
                                    dataKey="keyword"
                                    stroke="#9ca3af"
                                    fontSize={12}
                                    width={100}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#1f2937",
                                        border: "1px solid #374151",
                                        borderRadius: "8px",
                                    }}
                                    labelStyle={{ color: "#fff" }}
                                />
                                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatCard({
    title,
    value,
    icon,
    color,
}: {
    title: string
    value: number
    icon: React.ReactNode
    color: "purple" | "pink" | "cyan" | "amber"
}) {
    const colorClasses = {
        purple: "from-purple-500 to-purple-600",
        pink: "from-pink-500 to-pink-600",
        cyan: "from-cyan-500 to-cyan-600",
        amber: "from-amber-500 to-amber-600",
    }

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-400 text-sm">{title}</p>
                    <p className="text-3xl font-bold text-white mt-1">{value.toLocaleString()}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]}`}>
                    {icon}
                </div>
            </div>
        </div>
    )
}

function ScoreCard({
    title,
    value,
    maxValue,
    color,
}: {
    title: string
    value: number
    maxValue: number
    color: string
}) {
    const percentage = (value / maxValue) * 100

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <p className="text-gray-400 text-sm mb-2">{title}</p>
            <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-white">{value}</span>
                <span className="text-gray-500 text-lg mb-1">/ {maxValue}</span>
            </div>
            <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                        width: `${percentage}%`,
                        backgroundColor: color,
                    }}
                />
            </div>
        </div>
    )
}
