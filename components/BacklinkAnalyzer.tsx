"use client"

import { useState } from "react"
import {
    AlertTriangle,
    CheckCircle,
    ExternalLink,
    Link2,
    RefreshCw,
    Shield,
    Download,
    Copy,
    Check,
    ChevronDown,
    ChevronUp,
    TrendingUp,
    Mail,
    XCircle,
    Sparkles,
    Target,
    Users
} from "lucide-react"
import { Button } from "@/components/ui/button"

// Types
interface ToxicLink {
    url: string
    domain: string
    toxicityScore: number
    reasons: string[]
    firstSeen: string
    linkType: "dofollow" | "nofollow"
    anchorText: string
}

interface QualityMetrics {
    averageDomainAuthority: number
    dofollowRatio: number
    relevanceScore: number
    distribution: {
        highQuality: number
        mediumQuality: number
        lowQuality: number
    }
    topTLDs: { tld: string; count: number }[]
}

interface LostLink {
    url: string
    domain: string
    lastSeen: string
    reason: string
    domainAuthority: number
    anchorText: string
    reclaimable: boolean
}

interface AnchorTextDistribution {
    branded: { text: string; count: number; percentage: number }[]
    exact: { text: string; count: number; percentage: number }[]
    partial: { text: string; count: number; percentage: number }[]
    generic: { text: string; count: number; percentage: number }[]
    naked: { text: string; count: number; percentage: number }[]
    overOptimizationRisk: "low" | "medium" | "high"
    totalUniqueAnchors: number
}

interface ReferringDomain {
    domain: string
    domainAuthority: number
    backlinks: number
    dofollowLinks: number
    firstSeen: string
    topAnchor: string
    traffic: number
}

interface BacklinkAnalysisResult {
    id?: string
    domain: string
    healthScore: number
    toxicScore: number
    qualityScore: number
    totalBacklinks: number
    dofollowCount: number
    nofollowCount: number
    toxicLinks: ToxicLink[]
    qualityMetrics: QualityMetrics
    lostLinks: LostLink[]
    anchorText: AnchorTextDistribution
    topReferrers: ReferringDomain[]
}

interface UnlinkedMention {
    sourceUrl: string
    sourceDomain: string
    domainAuthority: number
    mentionContext: string
    mentionType: string
    dateFound: string
    estimatedTraffic: number
    outreachTemplate: string
    status: string
}

interface BrokenLinkOpportunity {
    sourceUrl: string
    sourceDomain: string
    domainAuthority: number
    brokenUrl: string
    originalAnchor: string
    suggestedReplacement: string
    relevanceScore: number
    estimatedValue: string
    outreachTemplate: string
    status: string
}

interface BacklinkOpportunitiesResult {
    domain: string
    totalOpportunities: number
    unlinkedMentions: UnlinkedMention[]
    brokenLinkTargets: BrokenLinkOpportunity[]
    competitorGaps: any[]
}

// Score component
function ScoreCard({ label, score, color }: { label: string; score: number; color: string }) {
    return (
        <div className={`p-4 rounded-lg border ${color}`}>
            <div className="text-sm text-slate-600 dark:text-slate-400">{label}</div>
            <div className="text-3xl font-bold mt-1">{score}</div>
        </div>
    )
}

// Main component
export function BacklinkAnalyzer() {
    const [domain, setDomain] = useState("")
    const [region, setRegion] = useState("US")
    const [loading, setLoading] = useState(false)
    const [loadingOpportunities, setLoadingOpportunities] = useState(false)
    const [analysis, setAnalysis] = useState<BacklinkAnalysisResult | null>(null)
    const [opportunities, setOpportunities] = useState<BacklinkOpportunitiesResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<"analysis" | "opportunities">("analysis")
    const [copied, setCopied] = useState(false)
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

    const regions = [
        { id: "US", name: "United States" },
        { id: "UK", name: "United Kingdom" },
        { id: "CA", name: "Canada" },
        { id: "AU", name: "Australia" },
        { id: "DE", name: "Germany" },
        { id: "FR", name: "France" },
        { id: "IN", name: "India" }
    ]

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
    }

    const handleAnalyze = async () => {
        if (!domain.trim()) {
            setError("Please enter a domain to analyze")
            return
        }

        setLoading(true)
        setError(null)

        try {
            const response = await fetch("/api/backlinks/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    domain: domain.trim(),
                    region
                })
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || "Failed to analyze backlinks")
            }

            const data = await response.json()
            setAnalysis(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to analyze backlinks")
        } finally {
            setLoading(false)
        }
    }

    const handleGenerateOpportunities = async () => {
        if (!domain.trim()) return

        setLoadingOpportunities(true)

        try {
            const response = await fetch("/api/backlinks/opportunities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    domain: domain.trim(),
                    region
                })
            })

            if (!response.ok) {
                throw new Error("Failed to generate opportunities")
            }

            const data = await response.json()
            setOpportunities(data)
            setActiveTab("opportunities")
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate opportunities")
        } finally {
            setLoadingOpportunities(false)
        }
    }

    const handleDownloadDisavow = async () => {
        if (!analysis?.toxicLinks.length) return

        try {
            const response = await fetch(`/api/backlinks/${analysis.id || "temp"}/disavow`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ toxicLinks: analysis.toxicLinks })
            })

            const data = await response.json()

            // Create and download file
            const blob = new Blob([data.content], { type: "text/plain" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = data.filename || "disavow.txt"
            a.click()
            URL.revokeObjectURL(url)
        } catch (err) {
            console.error("Failed to download disavow file:", err)
        }
    }

    const handleCopyTemplate = async (template: string) => {
        await navigator.clipboard.writeText(template)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const getScoreColor = (score: number, inverse = false) => {
        if (inverse) {
            if (score <= 20) return "border-green-200 bg-green-50 dark:bg-green-900/20"
            if (score <= 40) return "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20"
            return "border-red-200 bg-red-50 dark:bg-red-900/20"
        }
        if (score >= 70) return "border-green-200 bg-green-50 dark:bg-green-900/20"
        if (score >= 40) return "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20"
        return "border-red-200 bg-red-50 dark:bg-red-900/20"
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    Backlink Analysis
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Analyze your backlink profile and discover link building opportunities
                </p>
            </div>

            {/* Domain Input */}
            <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm border">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Domain
                        </label>
                        <input
                            type="text"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            placeholder="example.com"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                        />
                    </div>
                    <div className="w-full md:w-64">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Target Region
                        </label>
                        <div className="relative">
                            <select
                                value={region}
                                onChange={(e) => setRegion(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg appearance-none bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {regions.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-slate-500 pointer-events-none" />
                        </div>
                    </div>
                    <div className="flex items-end gap-2">
                        <Button
                            onClick={handleAnalyze}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Link2 className="w-4 h-4 mr-2" />
                                    Analyze Backlinks
                                </>
                            )}
                        </Button>
                        <Button
                            onClick={handleGenerateOpportunities}
                            disabled={loadingOpportunities || !domain.trim()}
                            variant="outline"
                        >
                            {loadingOpportunities ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Find Opportunities
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {error}
                    </div>
                )}
            </div>

            {/* Tabs */}
            {(analysis || opportunities) && (
                <div className="flex gap-2 border-b">
                    <button
                        className={`px-4 py-2 font-medium ${activeTab === "analysis" ? "border-b-2 border-blue-500 text-blue-600" : "text-slate-500"}`}
                        onClick={() => setActiveTab("analysis")}
                    >
                        <Shield className="w-4 h-4 inline mr-2" />
                        Backlink Health
                    </button>
                    <button
                        className={`px-4 py-2 font-medium ${activeTab === "opportunities" ? "border-b-2 border-blue-500 text-blue-600" : "text-slate-500"}`}
                        onClick={() => setActiveTab("opportunities")}
                    >
                        <TrendingUp className="w-4 h-4 inline mr-2" />
                        Opportunities {opportunities && `(${opportunities.totalOpportunities})`}
                    </button>
                </div>
            )}

            {/* Analysis Results */}
            {activeTab === "analysis" && analysis && (
                <div className="space-y-6">
                    {/* Score Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <ScoreCard label="Health Score" score={analysis.healthScore} color={getScoreColor(analysis.healthScore)} />
                        <ScoreCard label="Quality Score" score={analysis.qualityScore} color={getScoreColor(analysis.qualityScore)} />
                        <ScoreCard label="Toxic Score" score={Math.round(analysis.toxicScore)} color={getScoreColor(analysis.toxicScore, true)} />
                        <ScoreCard label="Total Backlinks" score={analysis.totalBacklinks} color="border-slate-200 bg-slate-50 dark:bg-slate-800" />
                    </div>

                    {/* Dofollow/Nofollow Ratio */}
                    <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm border">
                        <h3 className="font-semibold mb-4">Link Type Distribution</h3>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm text-slate-600">Dofollow</span>
                                    <span className="text-sm font-medium">{analysis.dofollowCount}</span>
                                </div>
                                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-green-500"
                                        style={{ width: `${(analysis.dofollowCount / analysis.totalBacklinks) * 100}%` }}
                                    />
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm text-slate-600">Nofollow</span>
                                    <span className="text-sm font-medium">{analysis.nofollowCount}</span>
                                </div>
                                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-yellow-500"
                                        style={{ width: `${(analysis.nofollowCount / analysis.totalBacklinks) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Toxic Links */}
                    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border overflow-hidden">
                        <div
                            className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                            onClick={() => toggleSection("toxic")}
                        >
                            <h3 className="font-semibold flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                Toxic Links ({analysis.toxicLinks.length})
                            </h3>
                            <div className="flex items-center gap-2">
                                {analysis.toxicLinks.length > 0 && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => { e.stopPropagation(); handleDownloadDisavow(); }}
                                    >
                                        <Download className="w-4 h-4 mr-1" />
                                        Disavow File
                                    </Button>
                                )}
                                {expandedSections.toxic ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                        </div>
                        {expandedSections.toxic && (
                            <div className="border-t">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-800">
                                        <tr>
                                            <th className="text-left p-3">Domain</th>
                                            <th className="text-left p-3">Toxicity</th>
                                            <th className="text-left p-3">Reasons</th>
                                            <th className="text-left p-3">Anchor</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analysis.toxicLinks.map((link, idx) => (
                                            <tr key={idx} className="border-t">
                                                <td className="p-3">
                                                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                                        {link.domain}
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                </td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${link.toxicityScore >= 70 ? "bg-red-100 text-red-700" :
                                                        link.toxicityScore >= 50 ? "bg-orange-100 text-orange-700" :
                                                            "bg-yellow-100 text-yellow-700"
                                                        }`}>
                                                        {link.toxicityScore}%
                                                    </span>
                                                </td>
                                                <td className="p-3 text-slate-600">
                                                    {link.reasons.slice(0, 2).join(", ")}
                                                </td>
                                                <td className="p-3 text-slate-600 truncate max-w-[150px]">
                                                    {link.anchorText}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Anchor Text Distribution */}
                    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border overflow-hidden">
                        <div
                            className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                            onClick={() => toggleSection("anchor")}
                        >
                            <h3 className="font-semibold flex items-center gap-2">
                                <Target className="w-5 h-5 text-blue-500" />
                                Anchor Text Analysis
                                <span className={`ml-2 px-2 py-0.5 rounded text-xs ${analysis.anchorText.overOptimizationRisk === "high" ? "bg-red-100 text-red-700" :
                                    analysis.anchorText.overOptimizationRisk === "medium" ? "bg-yellow-100 text-yellow-700" :
                                        "bg-green-100 text-green-700"
                                    }`}>
                                    {analysis.anchorText.overOptimizationRisk} risk
                                </span>
                            </h3>
                            {expandedSections.anchor ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                        {expandedSections.anchor && (
                            <div className="border-t p-4">
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    {[
                                        { label: "Branded", data: analysis.anchorText.branded, color: "bg-blue-500" },
                                        { label: "Partial Match", data: analysis.anchorText.partial, color: "bg-green-500" },
                                        { label: "Exact Match", data: analysis.anchorText.exact, color: "bg-yellow-500" },
                                        { label: "Generic", data: analysis.anchorText.generic, color: "bg-purple-500" },
                                        { label: "Naked URL", data: analysis.anchorText.naked, color: "bg-slate-500" }
                                    ].map(category => (
                                        <div key={category.label}>
                                            <div className="text-sm font-medium mb-2">{category.label}</div>
                                            {category.data.slice(0, 3).map((item, idx) => (
                                                <div key={idx} className="text-xs text-slate-600 truncate">
                                                    {item.text} ({item.percentage}%)
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Lost Links */}
                    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border overflow-hidden">
                        <div
                            className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                            onClick={() => toggleSection("lost")}
                        >
                            <h3 className="font-semibold flex items-center gap-2">
                                <XCircle className="w-5 h-5 text-orange-500" />
                                Lost Links ({analysis.lostLinks.length})
                            </h3>
                            {expandedSections.lost ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                        {expandedSections.lost && (
                            <div className="border-t">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-800">
                                        <tr>
                                            <th className="text-left p-3">Domain</th>
                                            <th className="text-left p-3">DA</th>
                                            <th className="text-left p-3">Reason</th>
                                            <th className="text-left p-3">Reclaimable</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analysis.lostLinks.map((link, idx) => (
                                            <tr key={idx} className="border-t">
                                                <td className="p-3 text-blue-600">{link.domain}</td>
                                                <td className="p-3">{link.domainAuthority}</td>
                                                <td className="p-3 text-slate-600 capitalize">{link.reason.replace("_", " ")}</td>
                                                <td className="p-3">
                                                    {link.reclaimable ? (
                                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                                    ) : (
                                                        <XCircle className="w-4 h-4 text-red-500" />
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Top Referrers */}
                    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border overflow-hidden">
                        <div
                            className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                            onClick={() => toggleSection("referrers")}
                        >
                            <h3 className="font-semibold flex items-center gap-2">
                                <Users className="w-5 h-5 text-green-500" />
                                Top Referring Domains ({analysis.topReferrers.length})
                            </h3>
                            {expandedSections.referrers ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                        {expandedSections.referrers && (
                            <div className="border-t">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-800">
                                        <tr>
                                            <th className="text-left p-3">Domain</th>
                                            <th className="text-left p-3">DA</th>
                                            <th className="text-left p-3">Backlinks</th>
                                            <th className="text-left p-3">Traffic</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analysis.topReferrers.map((ref, idx) => (
                                            <tr key={idx} className="border-t">
                                                <td className="p-3 text-blue-600">{ref.domain}</td>
                                                <td className="p-3">{ref.domainAuthority}</td>
                                                <td className="p-3">{ref.backlinks}</td>
                                                <td className="p-3">{ref.traffic.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Opportunities Tab */}
            {activeTab === "opportunities" && opportunities && (
                <div className="space-y-6">
                    {/* Unlinked Mentions */}
                    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border">
                        <div className="p-4 border-b">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Mail className="w-5 h-5 text-blue-500" />
                                Unlinked Brand Mentions ({opportunities.unlinkedMentions.length})
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">
                                These sites mention your brand but don't link to you
                            </p>
                        </div>
                        <div className="divide-y">
                            {opportunities.unlinkedMentions.map((mention, idx) => (
                                <div key={idx} className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <a href={mention.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium flex items-center gap-1">
                                                {mention.sourceDomain}
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                            <div className="text-sm text-slate-600 mt-1">
                                                DA: {mention.domainAuthority} • Traffic: {mention.estimatedTraffic.toLocaleString()}
                                            </div>
                                            <div className="text-sm text-slate-500 mt-2 italic">
                                                "{mention.mentionContext}"
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleCopyTemplate(mention.outreachTemplate)}
                                        >
                                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            <span className="ml-1">Copy Template</span>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Broken Link Opportunities */}
                    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border">
                        <div className="p-4 border-b">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Link2 className="w-5 h-5 text-orange-500" />
                                Broken Link Opportunities ({opportunities.brokenLinkTargets.length})
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">
                                Sites with broken links that you could replace
                            </p>
                        </div>
                        <div className="divide-y">
                            {opportunities.brokenLinkTargets.map((opp, idx) => (
                                <div key={idx} className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <a href={opp.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium flex items-center gap-1">
                                                {opp.sourceDomain}
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                            <div className="text-sm text-slate-600 mt-1">
                                                DA: {opp.domainAuthority} • Relevance: {opp.relevanceScore}%
                                            </div>
                                            <div className="text-sm mt-2">
                                                <span className="text-red-500 line-through">{opp.brokenUrl}</span>
                                                <span className="mx-2">→</span>
                                                <span className="text-green-600">{opp.suggestedReplacement}</span>
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1">
                                                Original anchor: "{opp.originalAnchor}"
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 items-end">
                                            <span className={`px-2 py-1 rounded text-xs ${opp.estimatedValue === "high" ? "bg-green-100 text-green-700" :
                                                opp.estimatedValue === "medium" ? "bg-yellow-100 text-yellow-700" :
                                                    "bg-slate-100 text-slate-700"
                                                }`}>
                                                {opp.estimatedValue} value
                                            </span>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleCopyTemplate(opp.outreachTemplate)}
                                            >
                                                <Copy className="w-4 h-4 mr-1" />
                                                Copy Template
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Competitor Gaps */}
                    {opportunities.competitorGaps.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border">
                            <div className="p-4 border-b">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Target className="w-5 h-5 text-purple-500" />
                                    Competitor Link Gaps ({opportunities.competitorGaps.length})
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    Links your competitors have that you don't
                                </p>
                            </div>
                            <div className="divide-y">
                                {opportunities.competitorGaps.map((gap, idx) => (
                                    <div key={idx} className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-medium">{gap.sourceDomain}</div>
                                                <div className="text-sm text-slate-600">
                                                    DA: {gap.domainAuthority} • Links to: {gap.competitorDomain}
                                                </div>
                                                <div className="text-sm text-slate-500 mt-2">
                                                    {gap.suggestedApproach}
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs ${gap.acquisitionDifficulty === "easy" ? "bg-green-100 text-green-700" :
                                                gap.acquisitionDifficulty === "medium" ? "bg-yellow-100 text-yellow-700" :
                                                    "bg-red-100 text-red-700"
                                                }`}>
                                                {gap.acquisitionDifficulty}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Empty State */}
            {!analysis && !opportunities && !loading && (
                <div className="bg-white dark:bg-slate-900 rounded-lg p-12 shadow-sm border text-center">
                    <Link2 className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600" />
                    <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
                        No Backlink Analysis Yet
                    </h3>
                    <p className="text-slate-500 mt-1 max-w-md mx-auto">
                        Enter a domain above to analyze its backlink profile, detect toxic links, and discover link building opportunities.
                    </p>
                </div>
            )}
        </div>
    )
}
